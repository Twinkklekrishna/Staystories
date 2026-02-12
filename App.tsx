
<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { User, Stay, LocationData, ExperienceType, NearbyPlace } from './types';
import { searchLocation, fetchStays, fetchNearbyAttractions } from './services/osmService';
import StayCard from './components/StayCard';
import AiChat from './components/AiChat';
import MemoryWall from './components/MemoryWall';
import { generateListingDescription } from './services/geminiService';
import { createStay } from './services/staysService';
import { register, login, clearToken, getToken } from './services/authService';

// --- Navbar ---
const Navbar: React.FC<{ user: User | null; onLogout: () => void }> = ({ user, onLogout }) => (
  <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
    <Link to="/" className="flex items-center gap-2">
      <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-lg">S</div>
      <span className="text-3xl font-black text-slate-900 tracking-tighter">STAY STORIES</span>
    </Link>
    <div className="flex items-center gap-8">
      {user ? (
        <>
          <Link to={user.role === 'host' ? "/host" : "/"} className="text-sm font-bold text-slate-600 hover:text-indigo-600">
            {user.role === 'host' ? 'Host Center' : 'Discovery'}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-slate-400">@{user.username}</span>
            <button onClick={onLogout} className="text-sm font-bold text-red-500 hover:text-red-700">Logout</button>
          </div>
        </>
      ) : (
        <Link to="/auth" className="bg-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
          Sign In
        </Link>
      )}
    </div>
  </nav>
);

// --- Auth Page ---
const AuthPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'traveler' | 'host'>('traveler');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Username and password required');
      return;
    }
    if (!isLogin && !email) {
      setError('Email is required for registration');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(username, password);
      } else {
        result = await register(username, email, password, role);
      }

      if (!result) {
        setError(isLogin ? 'Invalid credentials' : 'Registration failed');
        setLoading(false);
        return;
      }

      // Save token and user info
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      
      const user: User = { 
        username: result.user.username,
        email: result.user.email,
        role: result.user.role as 'traveler' | 'host'
      };
      onLogin(user);
      navigate(role === 'host' ? '/host' : '/');
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
        <h2 className="text-4xl font-black mb-2 text-slate-900">{isLogin ? 'Welcome' : 'Join Us'}</h2>
        <p className="text-slate-400 mb-10 font-medium">{isLogin ? 'Sign in to discover stays.' : 'Create an account to host or explore.'}</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
            <button 
              type="button" 
              onClick={() => setRole('traveler')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${role === 'traveler' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
            >
              Traveler
            </button>
            <button 
              type="button" 
              onClick={() => setRole('host')}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${role === 'host' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400'}`}
            >
              Host
            </button>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
              disabled={loading}
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Email</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest ml-1">Password</label>
            <input 
              type="password" 
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : (isLogin ? 'Enter App' : 'Create Account')}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-slate-500 font-medium">
          {isLogin ? "New here?" : "Already have an account?"} 
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setEmail(''); }} className="ml-2 text-indigo-600 font-bold hover:underline">
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

// --- Discovery Page ---
const DiscoverPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationData[]>([]);
  const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);
  const [stays, setStays] = useState<Stay[]>([]);
  const [activeExp, setActiveExp] = useState<ExperienceType>('Silent');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      const results = await searchLocation(val);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  };

  const selectLocation = (loc: LocationData) => {
    setSelectedLoc(loc);
    setSuggestions([]);
    setQuery(loc.name);
  };

  useEffect(() => {
    if (selectedLoc) {
      setLoading(true);
      fetchStays(selectedLoc.lat, selectedLoc.lon, activeExp)
        .then(setStays)
        .catch((err) => {
          console.error('Error fetching stays:', err);
          setStays([]);
        })
        .finally(() => setLoading(false));
    }
  }, [selectedLoc, activeExp]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-16 text-center max-w-4xl mx-auto">
        <h1 className="text-8xl md:text-9xl font-black text-slate-900 mb-4 tracking-tighter leading-none">
          STAY <span className="text-indigo-600">STORIES</span>
        </h1>
        <p className="text-2xl md:text-3xl font-bold text-slate-600 mb-4 tracking-tight">
          Unique stays for every <span className="text-indigo-600">mood.</span>
        </p>
        <p className="text-slate-400 text-lg font-medium mb-10 max-w-2xl mx-auto">
          Discover hand-picked local treasures powered by real-time OpenStreetMap data and AI assistance.
        </p>
        
        <div className="relative max-w-xl mx-auto">
          <div className="flex bg-white shadow-2xl rounded-3xl overflow-hidden border border-slate-100 p-3 ring-8 ring-slate-100/50">
            <div className="flex-1 flex items-center px-4">
              <span className="text-2xl mr-3 opacity-50">📍</span>
              <input 
                type="text" 
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Where are you dreaming of?" 
                className="w-full py-3 focus:outline-none text-slate-800 font-bold text-lg"
              />
            </div>
            <button className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Go</button>
          </div>
          
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-3xl shadow-[0_35px_60px_-15px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-40 text-left">
              {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => selectLocation(s)}
                  className="w-full px-6 py-5 hover:bg-indigo-50 border-b last:border-0 border-slate-50 transition-colors flex flex-col"
                >
                  <span className="font-bold text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-12">
        <div className="flex items-center gap-10 border-b border-slate-200">
          {(['Silent', 'Friendly', 'Cultural'] as ExperienceType[]).map(exp => (
            <button
              key={exp}
              onClick={() => setActiveExp(exp)}
              className={`pb-5 px-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeExp === exp ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {exp} Stays
              {activeExp === exp && <div className="absolute bottom-[-1px] left-0 right-0 h-1 bg-indigo-600 rounded-t-full shadow-[0_-4px_10px_rgba(79,70,229,0.3)]" />}
            </button>
          ))}
        </div>
      </div>

      {!selectedLoc ? (
        <div className="py-24 bg-indigo-50/50 rounded-[3rem] border-2 border-dashed border-indigo-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl mb-4">🏠</div>
          <p className="text-indigo-900 font-black text-xl mb-2">Ready to explore?</p>
          <p className="text-indigo-400 font-medium">Search for a location above to see local {activeExp.toLowerCase()} stays.</p>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-slate-100 animate-pulse h-96 rounded-[2.5rem]" />
          ))}
        </div>
      ) : stays.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {stays.map(stay => (
            <StayCard 
              key={stay.id} 
              stay={stay} 
              onVisit={(s) => {
                sessionStorage.setItem('selectedStay', JSON.stringify(s));
                navigate(`/stay/${s.id}`);
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-[2.5rem]">
          <p className="text-slate-500 font-bold text-lg">No {activeExp.toLowerCase()} spots found here. Try a different city!</p>
        </div>
      )}

      <MemoryWall />
    </div>
  );
};

// --- Stay Details Page ---
const StayDetailsPage: React.FC = () => {
  //test
  const { id } = useParams();
  const [stay, setStay] = useState<Stay | null>(null);
  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = sessionStorage.getItem('selectedStay');
    if (saved) {
      const parsed = JSON.parse(saved) as Stay;
      if (parsed.id === id) {
        setStay(parsed);
        fetchNearbyAttractions(parsed.lat, parsed.lon).then(setNearby);
      } else {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [id, navigate]);

  if (!stay) return (
    <div className="h-[80vh] flex items-center justify-center">
      <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <button onClick={() => navigate(-1)} className="mb-10 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition flex items-center gap-3 group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Discovery
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="rounded-[3rem] overflow-hidden h-[500px] shadow-2xl relative">
            <img src={stay.photoUrl && (stay.photoUrl.startsWith('data:') || stay.photoUrl.includes('base64')) ? stay.photoUrl : (stay.photoUrl || `https://picsum.photos/seed/${stay.id}/1200/800`)} alt={stay.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2s]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-12">
              <div>
                <div className="flex gap-3 mb-4">
                  <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {stay.experience} Stay
                  </span>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${stay.isAvailable ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {stay.isAvailable ? 'Available' : 'Booked'}
                  </span>
                </div>
                <h1 className="text-5xl font-black text-white">{stay.name}</h1>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Price</p>
              <p className="text-xl font-black text-slate-900">{stay.priceRange}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vibe</p>
              <p className="text-xl font-black text-indigo-600">{stay.experience}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
              <p className={`text-xl font-black ${stay.isAvailable ? 'text-emerald-500' : 'text-red-500'}`}>
                {stay.isAvailable ? 'Open' : 'Full'}
              </p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Type</p>
              <p className="text-xl font-black text-slate-900 capitalize">{stay.type.replace('_', ' ')}</p>
            </div>
          </div>

          <section>
            <h2 className="text-3xl font-black mb-6 text-slate-900 flex items-center gap-4">
              Overview <div className="h-1 flex-1 bg-slate-100 rounded-full" />
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">{stay.description}</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(stay.tags).map(([k, v], i) => (
                <span key={i} className="text-[10px] font-black bg-slate-100 text-slate-500 px-4 py-2 rounded-xl uppercase tracking-widest border border-slate-200">
                  {k.replace(':', ' ')}: {v}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-black mb-6 text-slate-900 flex items-center gap-4">
              Map <div className="h-1 flex-1 bg-slate-100 rounded-full" />
            </h2>
            <div className="h-96 bg-slate-200 rounded-[2.5rem] relative overflow-hidden group shadow-inner border-4 border-white ring-1 ring-slate-100">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight={0} 
                marginWidth={0} 
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${stay.lon-0.005}%2C${stay.lat-0.005}%2C${stay.lon+0.005}%2C${stay.lat+0.005}&layer=mapnik&marker=${stay.lat}%2C${stay.lon}`}
              ></iframe>
              <a 
                href={`https://www.openstreetmap.org/?mlat=${stay.lat}&mlon=${stay.lon}#map=17/${stay.lat}/${stay.lon}`}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-6 right-6 bg-white text-indigo-600 px-6 py-3 rounded-2xl text-sm font-black shadow-2xl hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-105"
              >
                Open in OpenStreetMap
              </a>
            </div>
          </section>
        </div>

        <aside className="space-y-10">
          <AiChat stay={stay} />

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center justify-between">
              Local Gems <span className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full">Nearby</span>
            </h3>
            <div className="space-y-4">
              {nearby.length > 0 ? nearby.map(place => (
                <a 
                  key={place.id}
                  href={`https://www.openstreetmap.org/#map=19/${place.lat}/${place.lon}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-indigo-100 transition-all group"
                >
                  <p className="font-black text-sm text-slate-800 line-clamp-1 mb-1">{place.name}</p>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{place.type.replace('_', ' ')}</p>
                  <div className="mt-4 flex items-center gap-1 text-indigo-600 text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    View Location <span>→</span>
                  </div>
                </a>
              )) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 text-xs italic font-medium">Scouting for attractions...</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

// --- Host Dashboard ---
const HostDashboard: React.FC = () => {
  const [stayName, setStayName] = useState('');
  const [exp, setExp] = useState<ExperienceType>('Silent');
  const [desc, setDesc] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationSearch = async (val: string) => {
    setLocationQuery(val);
    if (val.length > 2) {
      const results = await searchLocation(val);
      setLocationSuggestions(results);
    } else {
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (loc: LocationData) => {
    setSelectedLocation(loc);
    setLocationQuery(loc.name);
    setLocationSuggestions([]);
  };

  const handleAiDescription = async () => {
    if (!stayName) return alert("Please enter a stay name first.");
    setIsAiLoading(true);
    const text = await generateListingDescription(stayName, exp);
    setDesc(text);
    setIsAiLoading(false);
  };

  const handlePublish = async () => {
    if (!stayName || !desc) {
      alert('Please fill in stay name and description.');
      return;
    }
    if (!selectedLocation) {
      alert('Please select a location for your stay.');
      return;
    }
    if (!photoUrl) {
      alert('Please upload a photo of your stay.');
      return;
    }
    
    setIsPublishing(true);
    try {
      const newStay: Omit<Stay, 'id'> = {
        name: stayName,
        experience: exp,
        description: desc,
        lat: selectedLocation.lat,
        lon: selectedLocation.lon,
        type: 'hotel',
        priceRange: '$$',
        isAvailable: true,
        photoUrl: photoUrl,
        amenities: [],
        tags: { 'location': selectedLocation.name, 'vibe': exp.toLowerCase() }
      };

      const result = await createStay(newStay);
      if (result) {
        alert('✅ Listing published! Your stay has been saved to the database.');
        setStayName('');
        setDesc('');
        setPhotoUrl('');
        setLocationQuery('');
        setSelectedLocation(null);
        setExp('Silent');
      } else {
        alert('Failed to publish listing. Please try again.');
      }
    } catch (error) {
      console.error('Error publishing:', error);
      alert('Error publishing listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Host Management</h1>
          <p className="text-slate-500 font-medium">Create and optimize your unique property listings.</p>
        </div>
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chat Status</span>
            <span className={`text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-slate-400'}`}>
              {isOnline ? 'Available' : 'Paused'}
            </span>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)}
            className={`w-14 h-8 rounded-full relative transition-all ${isOnline ? 'bg-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1.5 w-5 h-5 rounded-full bg-white transition-all ${isOnline ? 'left-8' : 'left-1.5'}`} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] p-12 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />
        <h2 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-3">
          <span className="text-indigo-600">🏠</span> New Property Details
        </h2>
        <div className="space-y-10">
          
          {/* Photo Upload */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Property Photo</label>
            <div className="relative">
              <input 
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <label 
                htmlFor="photo-upload"
                className="flex items-center justify-center w-full p-8 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all group"
              >
                {photoUrl ? (
                  <div className="relative w-full">
                    <img src={photoUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-black text-sm">Change Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-4xl mb-3">📸</div>
                    <p className="text-slate-600 font-black mb-1">Upload a photo</p>
                    <p className="text-slate-400 text-xs">Click or drag your best property image here</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Location Selection */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Property Location</label>
            <div className="relative">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input 
                    type="text"
                    value={locationQuery}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    placeholder="Search for city or address..."
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                  />
                  {locationSuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden z-40">
                      {locationSuggestions.map((s, idx) => (
                        <button 
                          key={idx}
                          type="button"
                          onClick={() => selectLocation(s)}
                          className="w-full px-6 py-4 hover:bg-indigo-50 border-b last:border-0 border-slate-50 transition-colors text-left flex flex-col"
                        >
                          <span className="font-bold text-slate-900 text-sm">{s.name}</span>
                          <span className="text-xs text-slate-400 mt-1 line-clamp-1">{s.display_name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {selectedLocation && (
                <div className="mt-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-indigo-600">📍</span>
                    <div>
                      <p className="font-black text-sm text-indigo-900">{selectedLocation.name}</p>
                      <p className="text-xs text-indigo-600">Lat: {selectedLocation.lat.toFixed(4)}, Lon: {selectedLocation.lon.toFixed(4)}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      setSelectedLocation(null);
                      setLocationQuery('');
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-black"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Stay Name</label>
              <input 
                type="text" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold" 
                placeholder="e.g. Whispering Pine Hut" 
                value={stayName}
                onChange={(e) => setStayName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-3 tracking-widest ml-1">Experience Focus</label>
              <div className="flex gap-2">
                {['Silent', 'Friendly', 'Cultural'].map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => setExp(type as ExperienceType)}
                    className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${exp === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">AI Optimized Description</label>
              <button 
                type="button"
                onClick={handleAiDescription}
                disabled={isAiLoading}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full transition-all disabled:opacity-50"
              >
                ✨ {isAiLoading ? 'Writing...' : 'Write with Gemini'}
              </button>
            </div>
            <textarea 
              rows={5} 
              className="w-full px-6 py-5 rounded-[2rem] bg-slate-50 border border-slate-100 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium leading-relaxed" 
              placeholder="Tell your future guests the story of your stay..." 
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>

          <div className="pt-6">
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-lg hover:bg-black transition-all shadow-2xl hover:shadow-indigo-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPublishing ? 'Publishing...' : 'Publish Listing 🚀'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Wrapper ---
const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        // Clear invalid user data
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    clearToken();
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/auth" element={<AuthPage onLogin={setUser} />} />
          <Route path="/stay/:id" element={<StayDetailsPage />} />
          <Route path="/host" element={
            user?.role === 'host' ? <HostDashboard /> : <Navigate to="/auth" />
          } />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-200 mt-20 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-200 rounded flex items-center justify-center text-[10px] font-black text-slate-500">S</div>
            <span className="font-black text-sm tracking-tighter">STAY STORIES</span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest">© 2024 Discovery Hackathon Project</p>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <span className="hover:text-indigo-600 cursor-pointer">Terms</span>
            <span className="hover:text-indigo-600 cursor-pointer">Privacy</span>
            <span className="hover:text-indigo-600 cursor-pointer">Contact</span>
          </div>
        </footer>
      </div>
    </Router>
=======
import React, { useState, useEffect, useMemo } from 'react';
import { HashRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Home, BarChart3, ShieldAlert, CheckCircle2, XCircle, ChevronLeft, Lock, Unlock, Calendar, LayoutGrid, Users } from 'lucide-react';
import { SUBJECTS, STUDENTS, ADMIN_PASSWORD } from './constants';
import { AttendanceRecord, LockState, Year, Division, Subject } from './types';
import AttendanceView from './components/AttendanceView';
import StatsView from './components/StatsView';
import AdminView from './components/AdminView';
import StudentDetailsView from './components/StudentDetailsView';
import { generateMockAttendance } from './mockData';
import { apiService } from './apiService';

const Header: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const location = useLocation();
  const showAdminBadge = isAdmin && location.pathname === '/admin';

  return (
    <header className="bg-indigo-700 text-white p-4 sticky top-0 z-50 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-6 h-6" />
          <span>Sahrdaya Attendance</span>
        </h1>
        {showAdminBadge && (
          <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">
            Admin Mode
          </span>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [locks, setLocks] = useState<LockState>({});
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('is_admin') === 'true';
  });
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  // Load initial data from backend or use mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Test if backend is available
        const healthCheck = await fetch('http://localhost:5000/api/health').catch(() => null);
        
        if (healthCheck?.ok) {
          setUseBackend(true);
          // Load from backend
          const [attendanceData, locksData] = await Promise.all([
            apiService.getAttendance(),
            apiService.getLocks()
          ]);
          setAttendance(attendanceData || []);
          setLocks(locksData || {});
        } else {
          // Fallback to localStorage with mock data
          setUseBackend(false);
          const saved = localStorage.getItem('sahrdaya_attendance');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setAttendance(parsed);
            } else {
              const mockData = generateMockAttendance();
              setAttendance(mockData);
              localStorage.setItem('sahrdaya_attendance', JSON.stringify(mockData));
            }
          } else {
            const mockData = generateMockAttendance();
            setAttendance(mockData);
            localStorage.setItem('sahrdaya_attendance', JSON.stringify(mockData));
          }
          
          const savedLocks = localStorage.getItem('sahrdaya_locks');
          setLocks(savedLocks ? JSON.parse(savedLocks) : {});
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setUseBackend(false);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Sync attendance to backend/localStorage
  useEffect(() => {
    if (useBackend && attendance.length > 0) {
      // Debounce: save to backend
      const timer = setTimeout(() => {
        attendance.forEach(record => {
          apiService.saveAttendance(record).catch(console.error);
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!useBackend) {
      localStorage.setItem('sahrdaya_attendance', JSON.stringify(attendance));
    }
  }, [attendance, useBackend]);

  // Sync locks to backend/localStorage
  useEffect(() => {
    if (useBackend && Object.keys(locks).length > 0) {
      const timer = setTimeout(() => {
        Object.entries(locks).forEach(([key, value]) => {
          if (value) {
            apiService.toggleLock(key).catch(console.error);
          }
        });
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!useBackend) {
      localStorage.setItem('sahrdaya_locks', JSON.stringify(locks));
    }
  }, [locks, useBackend]);

  const saveAttendance = (newRecord: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(r => 
        !(r.date === newRecord.date && 
          r.subjectId === newRecord.subjectId && 
          r.period === newRecord.period &&
          r.division === newRecord.division)
      );
      return [...filtered, newRecord];
    });
    
    // Auto lock for non-admins to prevent teacher re-edits
    if (!isAdmin) {
      const lockKey = newRecord.period 
        ? `${newRecord.date}_${newRecord.subjectId}_P${newRecord.period}_${newRecord.division}`
        : `${newRecord.date}_${newRecord.subjectId}_${newRecord.division}`;

      setLocks(prev => ({ ...prev, [lockKey]: true }));
    }
  };

  const updateAttendance = (updatedRecord: AttendanceRecord) => {
    setAttendance(prev => {
      const filtered = prev.filter(r => 
        !(r.date === updatedRecord.date && 
          r.subjectId === updatedRecord.subjectId && 
          r.period === updatedRecord.period &&
          r.division === updatedRecord.division)
      );
      return [...filtered, updatedRecord];
    });
  };

  const handleAdminLogin = (password: string) => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem('is_admin', 'true');
      return true;
    }
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('is_admin');
  };

  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen max-w-md mx-auto bg-white shadow-xl relative">
        <Header isAdmin={isAdmin} />

        {/* Content */}
        <main className="flex-1 pb-24 p-4 overflow-y-auto no-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="inline-block animate-spin p-4 bg-indigo-500 rounded-full">
                  <div className="w-6 h-6"></div>
                </div>
                <p className="mt-4 text-slate-600 font-semibold">Loading attendance data...</p>
                <p className="text-xs text-slate-400 mt-1">{useBackend ? 'Using Backend' : 'Using Local Storage'}</p>
              </div>
            </div>
          ) : selectedStudent ? (
            <StudentDetailsView 
              studentId={selectedStudent} 
              attendance={attendance}
              onBack={() => setSelectedStudent(null)}
            />
          ) : (
            <Routes>
              <Route path="/" element={<AttendanceView attendance={attendance} locks={locks} onSave={saveAttendance} isAdmin={isAdmin} />} />
              <Route path="/stats" element={<StatsView attendance={attendance} onSelectStudent={setSelectedStudent} />} />
              <Route path="/admin" element={<AdminView 
                isAdmin={isAdmin} 
                onLogin={handleAdminLogin} 
                onLogout={handleAdminLogout}
                locks={locks}
                attendance={attendance}
                onToggleLock={(key) => setLocks(prev => ({ ...prev, [key]: !prev[key] }))}
                onUpdateAttendance={updateAttendance}
              />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          )}
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 py-3 px-6 flex justify-between items-center z-50">
          <NavLink to="/" icon={<Home className="w-6 h-6" />} label="Attendance" />
          <NavLink to="/stats" icon={<BarChart3 className="w-6 h-6" />} label="Statistics" />
          <NavLink to="/admin" icon={<ShieldAlert className="w-6 h-6" />} label="Admin" />
        </nav>
      </div>
    </HashRouter>
  );
};

const NavLink: React.FC<{ to: string, icon: React.ReactNode, label: string }> = ({ to, icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
      {icon}
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
>>>>>>> ac92b0f (Initial commit - Sahrdaya Attendance App)
  );
};

export default App;
