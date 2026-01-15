
import { LocationData, Stay, ExperienceType, NearbyPlace } from '../types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

export const searchLocation = async (query: string): Promise<LocationData[]> => {
  try {
    const response = await fetch(`${NOMINATIM_URL}?format=json&q=${encodeURIComponent(query)}&limit=5`);
    const data = await response.json();
    return data.map((item: any) => ({
      name: item.display_name.split(',')[0],
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    }));
  } catch (error) {
    console.error("Nominatim Search Error:", error);
    return [];
  }
};

export const fetchStays = async (lat: number, lon: number, experience: ExperienceType): Promise<Stay[]> => {
  try {
    console.log(`Searching for ${experience} stays near (${lat}, ${lon})`);
    
    // Fetch only real stays from database
    const dbStays = await fetchDatabaseStays(experience);
    console.log(`Found ${dbStays.length} stays with experience ${experience}`);
    
    if (dbStays.length === 0) {
      console.log('No stays found for this experience type');
      return [];
    }
    
    // Filter stays by proximity (within 500km of searched location to be more inclusive)
    const proximityRadiusKm = 500;
    const proximityRadius = proximityRadiusKm / 111; // ~111km per degree latitude
    
    console.log(`Proximity radius: ${proximityRadiusKm}km (${proximityRadius.toFixed(4)} degrees)`);
    
    const filteredStays = dbStays.filter((stay: Stay) => {
      if (!stay || stay.lat === undefined || stay.lon === undefined) {
        console.warn('Invalid stay data:', stay);
        return false;
      }
      const latDiff = stay.lat - lat;
      const lonDiff = stay.lon - lon;
      const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
      const distanceKm = distance * 111;
      
      console.log(`  "${stay.name}": (${stay.lat}, ${stay.lon}) -> distance: ${distanceKm.toFixed(2)}km`);
      return distance <= proximityRadius;
    });
    
    console.log(`After proximity filter: ${filteredStays.length} stays within ${proximityRadiusKm}km`);
    
    // Sort by proximity to searched location (closest first)
    filteredStays.sort((a: Stay, b: Stay) => {
      const distA = Math.sqrt(Math.pow(a.lat - lat, 2) + Math.pow(a.lon - lon, 2));
      const distB = Math.sqrt(Math.pow(b.lat - lat, 2) + Math.pow(b.lon - lon, 2));
      return distA - distB;
    });
    
    return filteredStays;
  } catch (error) {
    console.error("Error fetching stays:", error);
    return [];
  }
};

const fetchDatabaseStays = async (experience: ExperienceType): Promise<Stay[]> => {
  try {
    const response = await fetch('http://localhost:4000/api/stays');
    if (!response.ok) throw new Error('Failed to fetch stays');
    
    let stays = await response.json();
    console.log('Fetched all stays from DB:', stays);
    
    // Ensure lat/lon are numbers
    stays = stays.map((stay: any) => ({
      ...stay,
      lat: typeof stay.lat === 'string' ? parseFloat(stay.lat) : stay.lat,
      lon: typeof stay.lon === 'string' ? parseFloat(stay.lon) : stay.lon,
    }));
    
    // Filter stays by experience type
    const filtered = stays.filter((stay: Stay) => stay.experience === experience);
    console.log(`Filtered stays for experience "${experience}":`, filtered);
    
    return filtered;
  } catch (error) {
    console.error("Error fetching database stays:", error);
    return [];
  }
};

const fetchOSMStays = async (lat: number, lon: number, experience: ExperienceType): Promise<Stay[]> => {
  let filter = '';
  const radius = 10000; // 10km radius for discovery

  switch (experience) {
    case 'Silent':
      // Nature-based: camp sites, chalets, alpine huts
      filter = 'node["tourism"~"camp_site|chalet|alpine_hut"]';
      break;
    case 'Friendly':
      // Social: hostels, guest houses, motels
      filter = 'node["tourism"~"hostel|guest_house"]';
      break;
    case 'Cultural':
      // Heritage/Tradition: hotels (often heritage in historic areas) or specific tags
      filter = 'node["tourism"="hotel"]';
      break;
  }

  const query = `[out:json][timeout:25];
    (
      ${filter}(around:${radius},${lat},${lon});
      way["tourism"~"hotel|hostel|guest_house|camp_site|chalet"](around:${radius},${lat},${lon});
    );
    out center;`;

  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await response.json();

    return data.elements
      .filter((el: any) => el.tags && el.tags.name)
      .map((el: any) => {
        const coords = el.center ? el.center : { lat: el.lat, lon: el.lon };
        return {
          id: el.id.toString(),
          name: el.tags.name,
          type: el.tags.tourism || 'accommodation',
          lat: coords.lat,
          lon: coords.lon,
          description: el.tags.description || `A unique ${experience.toLowerCase()} stay located in a beautiful setting. Explore the local culture and surroundings.`,
          priceRange: "$$ - $$$",
          experience,
          amenities: Object.keys(el.tags).filter(k => k.startsWith('amenity')).map(k => el.tags[k]),
          tags: el.tags,
          isAvailable: Math.random() > 0.2,
        };
      });
  } catch (error) {
    console.error("Overpass Stay Fetch Error:", error);
    return [];
  }
};

export const fetchNearbyAttractions = async (lat: number, lon: number): Promise<NearbyPlace[]> => {
  const query = `[out:json][timeout:25];
    (
      node["tourism"~"attraction|museum|viewpoint|artwork"](around:3000,${lat},${lon});
      way["tourism"~"attraction|museum|viewpoint|artwork"](around:3000,${lat},${lon});
    );
    out center limit 8;`;
  
  try {
    const response = await fetch(OVERPASS_URL, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await response.json();

    return data.elements.map((el: any) => ({
      id: el.id.toString(),
      name: el.tags.name || 'Local Gem',
      lat: el.lat || (el.center && el.center.lat),
      lon: el.lon || (el.center && el.center.lon),
      type: el.tags.tourism || 'attraction',
    })).filter((p: any) => p.name !== 'Local Gem');
  } catch (error) {
    console.error("Overpass Attraction Fetch Error:", error);
    return [];
  }
};
