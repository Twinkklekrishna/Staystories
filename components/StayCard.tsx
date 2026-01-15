
import React from 'react';
import { Stay } from '../types';

interface StayCardProps {
  stay: Stay;
  onVisit: (stay: Stay) => void;
}

const StayCard: React.FC<StayCardProps> = ({ stay, onVisit }) => {
  // Use uploaded photo if available, otherwise generate a placeholder
  // Handle both base64 data URLs and regular URLs
  const imageUrl = stay.photoUrl && (stay.photoUrl.startsWith('data:') || stay.photoUrl.includes('base64'))
    ? stay.photoUrl
    : (stay.photoUrl || `https://picsum.photos/seed/${stay.id}/600/400`);

  const getThemeColor = () => {
    switch (stay.experience) {
      case 'Silent': return 'text-emerald-600 bg-emerald-50';
      case 'Friendly': return 'text-orange-600 bg-orange-50';
      case 'Cultural': return 'text-purple-600 bg-purple-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group">
      <div className="relative h-48 overflow-hidden">
        <img src={imageUrl} alt={stay.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getThemeColor()}`}>
          {stay.experience}
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{stay.name}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{stay.description}</p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-slate-900 font-semibold">{stay.priceRange}</span>
          <button 
            onClick={() => onVisit(stay)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            Visit Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default StayCard;
