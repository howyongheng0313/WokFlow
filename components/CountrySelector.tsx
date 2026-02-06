import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface CountrySelectorProps {
    selectedCountry: string;
    onSelect: (country: string) => void;
    onClose: () => void;
}

// List of all countries
const COUNTRIES_LIST = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

const CountrySelector: React.FC<CountrySelectorProps> = ({ selectedCountry, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter countries based on search term
    const filteredCountries = COUNTRIES_LIST.filter(country =>
        country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Auto-focus search input on mount
    useEffect(() => {
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, []);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    return (
        <div
            ref={wrapperRef}
            className="absolute top-full left-0 mt-2 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl z-50 w-full animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden flex flex-col max-h-[400px]"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Search Header */}
            <div className="p-3 border-b border-gray-100 bg-white/50">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search country..."
                        className="w-full h-10 pl-9 pr-4 bg-orange-50/50 border border-transparent rounded-lg text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#FF8C66] focus:ring-2 focus:ring-[#FF8C66]/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Countries List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                {filteredCountries.length > 0 ? (
                    <div className="py-1">
                        {filteredCountries.map((country) => (
                            <button
                                key={country}
                                onClick={() => {
                                    onSelect(country);
                                    onClose();
                                }}
                                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-between
                                    ${selectedCountry === country ? 'bg-orange-50 text-[#FF8C66]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#1A1A1A]'}
                                `}
                            >
                                <span>{country}</span>
                                {selectedCountry === country && <div className="w-2 h-2 rounded-full bg-[#FF8C66]"></div>}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400 text-sm">
                        No countries found
                    </div>
                )}
            </div>
        </div>
    );
};

export default CountrySelector;
