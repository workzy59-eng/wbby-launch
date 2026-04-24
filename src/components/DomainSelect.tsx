import React, { useState } from 'react';
import { Globe, Check, AlertCircle } from 'lucide-react';
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

  const domains = [
    '.com', '.org', '.net', '.in', '.co.in', '.io', '.me'
  ];

  const handleDomainChange = (val: string) => {
    setDomain(val);
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    const valid = domainRegex.test(val) || val === '';
    setIsValid(valid);
    if (valid) onSelect(val);
  };

  return (
    <div className="space-y-4">
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
            placeholder="example.com"
            className={cn(
              "pl-12 h-14 bg-black/20 border-white/10 text-white font-bold uppercase tracking-widest rounded-2xl focus-visible:ring-[#c7c42a]/20 focus-visible:border-[#c7c42a]/50",
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

      <div className="flex flex-wrap gap-2">
        {domains.map((ext) => (
          <button
            key={ext}
            type="button"
            onClick={() => handleDomainChange(domain.split('.')[0] + ext)}
            className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-white/40 uppercase tracking-widest hover:bg-[#c7c42a] hover:text-black transition-all"
          >
            {ext}
          </button>
        ))}
      </div>
    </div>
  );
}
