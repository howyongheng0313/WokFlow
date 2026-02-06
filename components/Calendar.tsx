import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface CalendarProps {
    selectedDate: string;
    onSelect: (date: string) => void;
    onClose: () => void;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onSelect, onClose }) => {
    // Current date logic
    const today = new Date();
    // Default to viewing current date if no selectedDate, or the selectedDate
    const [view, setView] = useState(() => {
        if (selectedDate) {
            const [y, m] = selectedDate.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m)) return { year: y, month: m - 1 };
        }
        return { year: today.getFullYear(), month: today.getMonth() };
    });

    const calendarRef = useRef<HTMLDivElement>(null);

    // Update view when selectedDate changes externally
    useEffect(() => {
        if (selectedDate) {
            const [y, m] = selectedDate.split('-').map(Number);
            if (!isNaN(y) && !isNaN(m)) {
                setView({ year: y, month: m - 1 });
            }
        }
    }, [selectedDate]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const daysInMonth = getDaysInMonth(view.year, view.month);
    const firstDay = getFirstDayOfMonth(view.year, view.month);
    const days = [];

    // Empty slots
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
    }

    // Days
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${view.year}-${(view.month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
        const isSelected = selectedDate === dateStr;
        const isToday = new Date().toDateString() === new Date(view.year, view.month, i).toDateString();

        days.push(
            <button
                key={i}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSelect(dateStr);
                    // Don't close immediately to allow seeing selection, or do? Implementation plan said "onSelect", usually implies close.
                    // Let's close it.
                    onClose();
                }}
                className={`h-8 w-8 rounded-full text-sm font-medium flex items-center justify-center transition-all
                    ${isSelected ? 'bg-gradient-to-r from-[#FF8C66] to-[#FF6B4A] text-white shadow-md' : 'text-gray-700 hover:bg-orange-50 hover:text-[#FF8C66]'}
                    ${!isSelected && isToday ? 'border border-[#FF8C66] text-[#FF8C66]' : ''}
                `}
            >
                {i}
            </button>
        );
    }

    const currentYear = new Date().getFullYear();
    // Years range: 1900 to current year
    const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i).reverse();

    return (
        <div
            ref={calendarRef}
            className="absolute top-full left-0 mt-2 p-4 bg-white/90 backdrop-blur-xl border border-white/50 rounded-xl shadow-2xl z-50 w-full min-w-[300px] animate-in fade-in slide-in-from-top-2 duration-200"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="flex gap-3 mb-4 px-1">
                <div className="relative flex-[3]">
                    <select
                        className="w-full appearance-none bg-orange-50/50 hover:bg-white border border-orange-200/50 hover:border-orange-400 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all cursor-pointer"
                        value={view.month}
                        onChange={(e) => setView({ ...view, month: parseInt(e.target.value) })}
                    >
                        {MONTH_NAMES.map((m, i) => (
                            <option key={i} value={i}>{m}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
                <div className="relative flex-[2]">
                    <select
                        className="w-full appearance-none bg-orange-50/50 hover:bg-white border border-orange-200/50 hover:border-orange-400 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#FF8C66]/20 focus:border-[#FF8C66] transition-all cursor-pointer"
                        value={view.year}
                        onChange={(e) => setView({ ...view, year: parseInt(e.target.value) })}
                    >
                        {years.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
            </div>

            {/* Header for Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2 border-b border-gray-100 pb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {days}
            </div>
        </div>
    );
};

export default Calendar;
