import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sample data - In a real app, this could be a larger JSON or API
const INDIAN_STATES_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool"],
  "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala"],
  "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro"],
  "Karnataka": ["Bangalore", "Hubli", "Mysore", "Gulbarga"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad"],
  "Manipur": ["Imphal"],
  "Meghalaya": ["Shillong"],
  "Mizoram": ["Aizawl"],
  "Nagaland": ["Kohima", "Dimapur"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Udaipur"],
  "Sikkim": ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad"],
  "Tripura": ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Noida"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee"],
  "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol"],
  "Delhi": ["New Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
  "Ladakh": ["Leh"]
};

interface StateCityDropdownProps {
  onSelect: (state: string, city: string) => void;
  initialState?: string;
  initialCity?: string;
}

export default function StateCityDropdown({ onSelect, initialState = '', initialCity = '' }: StateCityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'states' | 'cities'>('states');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStates = Object.keys(INDIAN_STATES_CITIES).filter(state => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCities = selectedState ? INDIAN_STATES_CITIES[selectedState].filter(city => 
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleStateSelect = (state: string) => {
    setSelectedState(state);
    setSearchTerm('');
    setView('cities');
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    onSelect(selectedState, city);
    setIsOpen(false);
    setSearchTerm('');
  };

  const reset = () => {
    setSelectedState('');
    setSelectedCity('');
    setView('states');
    setSearchTerm('');
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all"
      >
        <div className="flex items-center gap-3">
          <MapPin size={20} className="text-[#c7c42a]" />
          <span className="text-white font-medium">
            {selectedState && selectedCity ? `${selectedCity}, ${selectedState}` : 'Select State & City'}
          </span>
        </div>
        <ChevronDown size={20} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute z-50 w-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={view === 'states' ? "Search state..." : `Search city in ${selectedState}...`}
                  className="w-full bg-white/5 border-none rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#c7c42a]/50"
                  autoFocus
                />
                {selectedState && (
                   <button 
                    onClick={() => setView('states')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-[#c7c42a] hover:underline"
                   >
                     Back to States
                   </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
              {view === 'states' ? (
                filteredStates.length > 0 ? (
                  filteredStates.map(state => (
                    <div
                      key={state}
                      onClick={() => handleStateSelect(state)}
                      className="px-6 py-4 hover:bg-[#c7c42a] hover:text-black transition-colors cursor-pointer text-white/80 font-medium border-b border-white/5 last:border-none"
                    >
                      {state}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 italic">No states found</div>
                )
              ) : (
                filteredCities.length > 0 ? (
                  filteredCities.map(city => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="px-6 py-4 hover:bg-[#c7c42a] hover:text-black transition-colors cursor-pointer text-white/80 font-medium border-b border-white/5 last:border-none"
                    >
                      {city}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 italic">No cities found</div>
                )
              )}
            </div>
            
            {/* Footer */}
            {(selectedState || selectedCity) && (
              <div className="p-3 bg-black/40 text-center">
                <button 
                  onClick={reset}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:text-red-400 flex items-center justify-center gap-2 mx-auto"
                >
                  <X size={12} /> Clear Selection
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
