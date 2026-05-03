"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { 
  getCountries, 
  getCountryCallingCode, 
  AsYouType, 
  validatePhoneNumberLength,
  parsePhoneNumberFromString,
  CountryCode
} from "libphonenumber-js";

// Basic country name mapping for common countries
// We can use Intl.DisplayNames if available for more
const countryNames: Record<string, string> = {
  LK: "Sri Lanka",
  IN: "India",
  US: "United States",
  GB: "United Kingdom",
  AU: "Australia",
  CA: "Canada",
  SG: "Singapore",
  MY: "Malaysia",
  AE: "United Arab Emirates",
  DE: "Germany",
  FR: "France",
  JP: "Japan",
  CN: "China",
  NZ: "New Zealand",
  CH: "Switzerland",
  IT: "Italy",
  ES: "Spain",
  RU: "Russia",
  BR: "Brazil",
  ZA: "South Africa",
  TH: "Thailand",
  VN: "Vietnam",
  KR: "South Korea",
  NP: "Nepal",
  BT: "Bhutan",
  MM: "Myanmar",
};

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
}

export default function PhoneInput({
  value,
  onChange,
  label,
  required = false,
  className = "",
  error,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>("LK");
  const [localNumber, setLocalNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const lastValueRef = useRef(value);

  // Initialize from value prop only if it changes from outside
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value;
      if (value && value.startsWith("+")) {
        const phoneNumber = parsePhoneNumberFromString(value);
        if (phoneNumber && phoneNumber.country) {
          setSelectedCountry(phoneNumber.country);
          setLocalNumber(phoneNumber.nationalNumber as string);
        }
      } else if (!value) {
        setLocalNumber("");
      }
    }
  }, [value]);

  const countries = getCountries().map((code) => ({
    code,
    name: countryNames[code] || code,
    dialCode: `+${getCountryCallingCode(code)}`,
  })).sort((a, b) => {
    // Put priority countries at the top
    const priority = ["LK", "IN"];
    if (priority.includes(a.code) && !priority.includes(b.code)) return -1;
    if (!priority.includes(a.code) && priority.includes(b.code)) return 1;
    return a.name.localeCompare(b.name);
  });

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleCountrySelect = (country: typeof countries[0]) => {
    setSelectedCountry(country.code);
    setIsOpen(false);
    setSearch("");
    
    // Update full value
    const newFullValue = `${country.dialCode}${localNumber}`;
    onChange(newFullValue);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\D/g, "");
    setLocalNumber(input);
    
    const dialCode = `+${getCountryCallingCode(selectedCountry)}`;
    onChange(`${dialCode}${input}`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentDialCode = `+${getCountryCallingCode(selectedCountry)}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative flex gap-2">
        {/* Country Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[46px] px-3 flex items-center gap-2 rounded-xl border border-sand bg-cream/50 text-foreground hover:bg-cream transition-all duration-300 min-w-[100px] justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg leading-none">
                {getFlagEmoji(selectedCountry)}
              </span>
              <span className="text-sm font-medium">{currentDialCode}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl border border-sand shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-2 border-b border-sand/50 bg-cream/30">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" size={14} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search country..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-sand rounded-xl text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => handleCountrySelect(c)}
                      className={`w-full px-4 py-2.5 flex items-center justify-between hover:bg-saffron/5 transition-colors text-left ${
                        selectedCountry === c.code ? "bg-saffron/10 text-saffron-dark font-medium" : "text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg leading-none">{getFlagEmoji(c.code)}</span>
                        <span className="text-sm truncate max-w-[120px]">{c.name}</span>
                      </div>
                      <span className="text-xs text-warm-gray font-mono">{c.dialCode}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-warm-gray">
                    No countries found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Number Input */}
        <input
          type="tel"
          value={localNumber}
          onChange={handleNumberChange}
          placeholder="77 123 4567"
          className={`flex-1 px-4 py-3 rounded-xl border border-sand bg-cream/50 text-foreground placeholder:text-warm-gray/50 text-sm focus:outline-none focus:border-saffron focus:ring-1 focus:ring-saffron transition-all duration-300 ${
            error ? "border-red-500 ring-1 ring-red-500" : ""
          }`}
        />
      </div>

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// Helper to get flag emoji
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
