import React, { useState } from 'react';
import { Globe, Check, AlertCircle, Plus, ExternalLink } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { cn } from '@/lib/utils';

interface DomainSelectProps {
  onSelect: (domain: string) => void;
  initialValue?: string;
}

export function DomainSelect({ onSelect, initialValue = '' }: DomainSelectProps) {
  const [domain, setDomain] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);

  const availableExtensions = [
    { ext: '.com', price: '₹999/yr', available: true },
    { ext: '.in', price: '₹599/yr', available: true },
    { ext: '.online', price: '₹199/yr', available: true },
    { ext: '.site', price: '₹149/yr', available: true }
  ];

  const handleDomainChange = (val: string) => {
    setDomain(val);
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const valid = domainRegex.test(val) || val === '';
    setIsValid(valid);
    if (valid) onSelect(val);
  };

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="domain" className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-4 italic">
          Domain Selection
        </Label>
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#c7c42a] transition-colors">
            <Globe size={20} />
          </div>
          <Input
            id="domain"
            value={domain}
            onChange={(e) => handleDomainChange(e.target.value)}
            placeholder="Type your desired name..."
            className={cn(
              "pl-12 h-16 bg-black/40 border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl focus-visible:ring-[#c7c42a]/20 focus-visible:border-[#c7c42a]/50 text-base",
              !isValid && "border-red-500/50 focus-visible:border-red-500/50 focus-visible:ring-red-500/10"
            )}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {isValid ? (
              domain && <Check size={18} className="text-[#c7c42a]" />
            ) : (
              <AlertCircle size={18} className="text-red-500" />
            )}
          </div>
        </div>
        {!isValid && (
          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest ml-4 mt-2">
            Please enter a valid domain format
          </p>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] italic ml-4">Available Suggestions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {availableExtensions.map((item) => {
            const domainName = domain.split('.')[0] || 'mysite';
            const fullDomain = domainName + item.ext;
            const isSelected = domain === fullDomain;

            return (
              <button
                key={item.ext}
                type="button"
                onClick={() => handleDomainChange(fullDomain)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all group",
                  isSelected 
                    ? "bg-[#c7c42a] border-[#c7c42a] text-black" 
                    : "bg-white/5 border-white/5 text-white hover:border-[#c7c42a]/30 hover:bg-white/10"
                )}
              >
                <div className="text-left">
                  <p className={cn("text-xs font-black uppercase tracking-tighter", isSelected ? "text-black" : "text-white")}>
                    {fullDomain}
                  </p>
                  <p className={cn("text-[9px] font-bold uppercase tracking-widest", isSelected ? "text-black/60" : "text-white/40")}>
                    Available • {item.price}
                  </p>
                </div>
                {isSelected ? <Check size={16} /> : <Plus size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            const custom = prompt('Enter your existing custom domain (e.g., example.com):');
            if (custom) handleDomainChange(custom);
          }}
          className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-[10px] font-black text-white/40 uppercase tracking-widest hover:border-[#c7c42a] hover:text-[#c7c42a] transition-all flex items-center justify-center gap-2"
        >
          <ExternalLink size={14} />
          Use my own custom domain
        </button>
      </div>
    </div>
  );
}
