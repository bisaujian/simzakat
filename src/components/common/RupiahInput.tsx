import React, { useState, useEffect } from 'react';
import { formatThousandsZero, parseThousands, terbilangRupiah } from '../../utils/helpers';

interface RupiahInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  prefix?: string;
  showTerbilang?: boolean;
  min?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
}

export const RupiahInput: React.FC<RupiahInputProps> = ({
  value,
  onChange,
  placeholder = '0',
  className = '',
  inputClassName = '',
  prefix = 'Rp',
  showTerbilang = false,
  min = 0,
  disabled = false,
  autoFocus = false,
  id,
}) => {
  // Local display state synced with prop value
  const [displayValue, setDisplayValue] = useState<string>(() => 
    value > 0 ? formatThousandsZero(value) : ''
  );

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatThousandsZero(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Keep only numbers
    const cleanDigits = raw.replace(/[^0-9]/g, '');

    if (!cleanDigits) {
      setDisplayValue('');
      onChange(0);
      return;
    }

    const numericValue = parseInt(cleanDigits, 10);
    const validValue = min !== undefined ? Math.max(min, numericValue) : numericValue;

    setDisplayValue(formatThousandsZero(validValue));
    onChange(validValue);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 text-xs font-bold text-slate-400 select-none pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          disabled={disabled}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-slate-300 transition outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 disabled:bg-slate-100 ${
            prefix ? 'pl-9 pr-3' : 'px-3'
          } py-2 text-sm ${inputClassName}`}
        />
      </div>

      {showTerbilang && value > 0 && (
        <p className="text-[11px] text-emerald-800 font-medium italic px-1 leading-snug">
          Terbilang: {terbilangRupiah(value)}
        </p>
      )}
    </div>
  );
};
