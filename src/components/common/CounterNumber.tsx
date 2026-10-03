import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { CurrencyCode } from '../../types/finance';

interface CounterNumberProps {
  value: number;
  currency?: CurrencyCode;
  isCurrency?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CounterNumber: React.FC<CounterNumberProps> = ({
  value,
  currency = 'INR',
  isCurrency = true,
  prefix = '',
  suffix = '',
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayValue;
    const endValue = value;
    const duration = 400; // ms

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutCubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easedProgress);

      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animFrame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animFrame);
  }, [value]);

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {isCurrency ? formatCurrency(displayValue, currency) : displayValue.toLocaleString()}
      {suffix}
    </span>
  );
};
