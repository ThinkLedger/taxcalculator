"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedNumberProps {
  value: string;
  className?: string;
  duration?: number;
}

export function AnimatedNumber({
  value,
  className,
  duration = 300,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (displayValue !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayValue(value);
        setTimeout(() => setIsAnimating(false), 50);
      }, duration / 2);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [value, duration, displayValue]);

  return (
    <span
      className={cn(
        "inline-block transition-all duration-300 ease-in-out",
        isAnimating && "scale-110 opacity-60",
        className
      )}
    >
      {displayValue}
    </span>
  );
}

