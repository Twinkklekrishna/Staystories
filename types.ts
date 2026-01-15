
export type ExperienceType = 'Silent' | 'Friendly' | 'Cultural';

export interface LocationData {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}

export interface Stay {
  id: string;
  name: string;
  type: string;
  lat: number;
  lon: number;
  description: string;
  priceRange: string;
  experience: ExperienceType;
  amenities: string[];
  tags: Record<string, string>;
  isAvailable: boolean;
  photoUrl?: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
}

export interface User {
  username: string;
  email?: string;
  role: 'traveler' | 'host';
}

export interface Memory {
  id: string;
  user: string;
  text: string;
  date: string;
}
