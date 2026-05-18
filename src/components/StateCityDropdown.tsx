import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Data mappings for India, US, and UK
const COUNTRY_DATA: Record<string, Record<string, string[]>> = {
  "India": {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur"],
    "Arunachal Pradesh": ["Itanagar", "Tawang", "Ziro", "Pasighat", "Naharlagun", "Roing"],
    "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur"],
    "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Arrah", "Begusarai"],
    "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Raigarh", "Jagdalpur"],
    "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Junagadh", "Gandhidham"],
    "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat"],
    "Himachal Pradesh": ["Shimla", "Manali", "Dharamshala", "Solan", "Mandi", "Palampur", "Kullu"],
    "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Phusro", "Hazaribagh", "Giridih"],
    "Karnataka": ["Bangalore", "Hubli", "Mysore", "Gulbarga", "Belgaum", "Mangalore", "Davanagere", "Bellary", "Shimoga"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Malappuram", "Kannur", "Kollam", "Alappuzha", "Palakkad"],
    "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Navi Mumbai", "Kolhapur", "Akola"],
    "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur"],
    "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongpoh"],
    "Mizoram": ["Aizawl", "Lunglei", "Saiha", "Champhai"],
    "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha"],
    "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Bhadrak"],
    "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Hoshiarpur", "Pathankot"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar", "Sikar"],
    "Sikkim": ["Gangtok", "Namchi", "Geyzing", "Mangan"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", "Erode", "Vellore", "Thoothukudi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", "Mahbubnagar"],
    "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailasahar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Noida"],
    "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur", "Kashipur", "Rishikesh"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri", "Maheshtala", "Rajpur Sonarpur", "Gopalpur", "Bhatpara"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi"],
  },
  "United States": {
    "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose", "Fresno"],
    "Texas": ["Houston", "Austin", "Dallas", "San Antonio", "Fort Worth", "El Paso"],
    "New York": ["New York City", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"],
    "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
    "Illinois": ["Chicago", "Aurora", "Rockford", "Joliet", "Naperville", "Springfield"],
    "Washington": ["Seattle", "Spokane", "Tacoma", "Vancouver", "Bellevue", "Kent"],
    "Massachusetts": ["Boston", "Worcester", "Springfield", "Cambridge", "Lowell", "Brockton"],
    "Georgia": ["Atlanta", "Columbus", "Augusta", "Macon", "Savannah", "Athens"],
    "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron", "Dayton"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"],
  },
  "United Kingdom": {
    "England": ["London", "Birmingham", "Manchester", "Liverpool", "Leeds", "Sheffield", "Bristol", "Leicester", "Coventry", "Hull"],
    "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness", "Perth", "Stirling"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry", "Neath"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"],
  }
};

interface StateCityDropdownProps {
  country: string;
  onSelect: (state: string, city: string) => void;
  initialState?: string;
  initialCity?: string;
  error?: string;
}

export default function StateCityDropdown({ country, onSelect, initialState = '', initialCity = '', error }: StateCityDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'states' | 'cities'>('states');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset selection when country changes
    setSelectedState('');
    setSelectedCity('');
    setView('states');
    setSearchTerm('');
  }, [country]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const statesData = COUNTRY_DATA[country] || {};
  const filteredStates = Object.keys(statesData).filter(state => 
    state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCities = (selectedState && statesData[selectedState]) 
    ? statesData[selectedState].filter(city => 
        city.toLowerCase().includes(searchTerm.toLowerCase())
      ) 
    : [];

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
    onSelect('', '');
  };

  const currentLabel = () => {
    if (selectedState && selectedCity) return `${selectedCity}, ${selectedState}`;
    if (selectedState) return `Select City in ${selectedState}`;
    return view === 'states' ? `Select ${country === 'United Kingdom' ? 'Region' : 'State'}` : 'Select City';
  };

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-white/5 border ${error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10'} rounded-2xl px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-white/10 transition-all ${error ? 'animate-shake' : ''}`}
      >
        <div className="flex items-center gap-3">
          <MapPin size={20} className={error ? 'text-red-500' : 'text-[#c7c42a]'} />
          <span className={`font-medium ${error ? 'text-red-500/80' : 'text-white'}`}>
            {currentLabel()}
          </span>
        </div>
        <ChevronDown size={20} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] font-black uppercase tracking-widest text-red-500 mt-2 ml-4 italic"
        >
          {error}
        </motion.p>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute z-[100] w-full mt-2 bg-[#111] border border-white/10 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-2xl"
          >
            {/* Search Header */}
            <div className="p-4 border-b border-white/5 bg-black/40">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={view === 'states' ? `Search ${country === 'United Kingdom' ? 'region' : 'state'}...` : `Search city in ${selectedState}...`}
                  className="w-full bg-white/5 border-none rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-[#c7c42a]/50 outline-none"
                  autoFocus
                />
                {selectedState && (
                   <button 
                    onClick={() => {
                      setView('states');
                      setSearchTerm('');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-tighter text-[#c7c42a] hover:underline"
                   >
                     Back
                   </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar bg-black/20">
              {view === 'states' ? (
                filteredStates.length > 0 ? (
                  filteredStates.sort().map(state => (
                    <div
                      key={state}
                      onClick={() => handleStateSelect(state)}
                      className="px-6 py-4 hover:bg-[#c7c42a] hover:text-black transition-all cursor-pointer text-white/80 font-medium border-b border-white/5 last:border-none flex items-center justify-between group"
                    >
                      {state}
                      <ChevronDown size={14} className="opacity-0 group-hover:opacity-100 -rotate-90 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 italic">No locations found</div>
                )
              ) : (
                filteredCities.length > 0 ? (
                  filteredCities.sort().map(city => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="px-6 py-4 hover:bg-[#c7c42a] hover:text-black transition-all cursor-pointer text-white/80 font-medium border-b border-white/5 last:border-none flex items-center justify-between group"
                    >
                      {city}
                      <Check size={14} className="opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-white/20 italic">No cities found</div>
                )
              )}
            </div>
            
            {/* Footer */}
            {(selectedState || selectedCity) && (
              <div className="p-3 bg-black/60 text-center border-t border-white/5">
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
