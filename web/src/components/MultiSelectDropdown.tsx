import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Search, X, Check, ChevronDown, CheckSquare, Square } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  subLabel?: string;
}

interface MultiSelectDropdownProps {
  label: string;
  icon?: LucideIcon;
  options: DropdownOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  theme?: 'light' | 'dark';
  align?: 'left' | 'right';
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  icon: Icon,
  options,
  selectedValues,
  onChange,
  placeholder,
  theme = 'light',
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Filter options based on typed search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term)) ||
        opt.value.toLowerCase().includes(term)
    );
  }, [options, searchTerm]);

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const handleSelectAll = () => {
    const visibleValues = filteredOptions.map((o) => o.value);
    const combined = Array.from(new Set([...selectedValues, ...visibleValues]));
    onChange(combined);
  };

  const handleClear = () => {
    if (searchTerm.trim()) {
      const visibleValues = new Set(filteredOptions.map((o) => o.value));
      onChange(selectedValues.filter((v) => !visibleValues.has(v)));
    } else {
      onChange([]);
    }
  };

  // Label to show in trigger button
  const triggerText = useMemo(() => {
    if (selectedValues.length === 0) {
      return placeholder || `Todas (${options.length})`;
    }
    if (selectedValues.length === 1) {
      const match = options.find((o) => o.value === selectedValues[0]);
      return match ? match.label : selectedValues[0];
    }
    return `${selectedValues.length} selecionados`;
  }, [selectedValues, options, placeholder]);

  return (
    <div className={`relative ${isOpen ? 'z-50' : 'z-10'}`} ref={dropdownRef}>
      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-lg border flex flex-col cursor-pointer transition-all select-none ${
          selectedValues.length > 0
            ? isDark
              ? 'bg-[#385463]/30 border-[#385463] text-white shadow-xs'
              : 'bg-blue-50/80 border-blue-300 text-slate-900 shadow-xs'
            : isDark
            ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500'
            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
        }`}
      >
        <div className="flex items-center justify-between space-x-1 mb-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1 cursor-pointer">
            {Icon && <Icon className="w-3 h-3 text-[#385463] dark:text-[#7bb0ce]" />}
            <span>{label}</span>
          </label>
          {selectedValues.length > 0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              title="Limpar seleção deste filtro"
              className="p-0.5 rounded-full hover:bg-slate-500/20 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <X className="w-3 h-3" />
            </span>
          )}
        </div>

        <div className="flex items-center justify-between space-x-1">
          <span
            className={`text-xs font-bold truncate block flex-1 ${
              selectedValues.length > 0
                ? isDark
                  ? 'text-[#e3e0b0]'
                  : 'text-[#385463]'
                : isDark
                ? 'text-slate-300'
                : 'text-slate-700'
            }`}
          >
            {triggerText}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#e84752]' : ''
            }`}
          />
        </div>
      </div>

      {/* Dropdown Popup Menu */}
      {isOpen && (
        <div
          className={`absolute ${
            align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          } w-72 sm:w-80 top-full mt-2 z-50 rounded-xl border shadow-2xl flex flex-col max-h-84 overflow-hidden animate-fade-in ${
            isDark
              ? 'bg-[#18222f] border-slate-600 text-slate-100 shadow-black/60'
              : 'bg-white border-slate-300 text-slate-800 shadow-slate-900/20'
          }`}
          style={{ zIndex: 9999 }}
        >
          {/* Search Input Box */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digitar para buscar..."
                className={`w-full pl-8 pr-7 py-1.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#385463] border ${
                  isDark
                    ? 'bg-slate-800 border-slate-600 text-white placeholder-slate-500'
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                }`}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Action Bar (Select All / Clear) */}
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-[11px] bg-slate-100/60 dark:bg-slate-800/60">
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[#385463] dark:text-[#7bb0ce] font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <CheckSquare className="w-3 h-3" />
              <span>Marcar todos ({filteredOptions.length})</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 dark:text-slate-400 hover:text-rose-500 font-bold hover:underline cursor-pointer flex items-center space-x-1"
            >
              <Square className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Scrollable Option Items */}
          <div className="overflow-y-auto p-1.5 max-h-56 divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Nenhum resultado para "{searchTerm}"
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-start space-x-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? isDark
                          ? 'bg-[#385463]/35 text-white'
                          : 'bg-blue-50 text-slate-900 font-semibold'
                        : isDark
                        ? 'hover:bg-slate-800/80 text-slate-300'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 mt-0.5 rounded flex items-center justify-center border transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#e84752] border-[#e84752] text-white shadow-xs'
                          : isDark
                          ? 'border-slate-500 bg-slate-800'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{opt.label}</div>
                      {opt.subLabel && opt.subLabel !== opt.label && (
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {opt.subLabel}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer with Status */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/90 flex items-center justify-between text-[11px] text-slate-400">
            <span>
              <strong className="text-slate-700 dark:text-slate-200">
                {selectedValues.length}
              </strong>{' '}
              de {options.length} selecionados
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-md bg-[#385463] hover:bg-[#2b3d4a] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
