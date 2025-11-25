"use client";

import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Clock } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility to merge Tailwind classes
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats total milliseconds into HH:MM:SS:ms string
 */
const formatTime = (totalMs: number) => {
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((totalMs % 1000) / 10); // Get first 2 digits of ms

  const pad = (num: number) => num.toString().padStart(2, "0");
  return {
    hours: pad(hours),
    minutes: pad(minutes),
    seconds: pad(seconds),
    ms: pad(ms),
    full: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
  };
};

export default function StopwatchPage() {
  // --- State ---
  // The starting time set by the user (in milliseconds)
  const [initialTime, setInitialTime] = useState<number>(0);
  // The current elapsed time (in milliseconds)
  const [currentTime, setCurrentTime] = useState<number>(0);
  // Whether the timer is currently running
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Input state for manual setting (HH:MM:SS)
  const [inputValues, setInputValues] = useState({ h: "00", m: "00", s: "00" });

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // --- Effects ---

  // Handle timer ticking
  useEffect(() => {
    if (isRunning) {
      lastTickRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        const delta = now - lastTickRef.current;
        lastTickRef.current = now;
        setCurrentTime((prev) => prev + delta);
      }, 10); // Update every 10ms for smooth display
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // --- Handlers ---

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(initialTime);
  };

  const handleSetTime = () => {
    const h = parseInt(inputValues.h, 10) || 0;
    const m = parseInt(inputValues.m, 10) || 0;
    const s = parseInt(inputValues.s, 10) || 0;
    
    // Clamp values
    const clampedH = Math.max(0, Math.min(23, h));
    const clampedM = Math.max(0, Math.min(59, m));
    const clampedS = Math.max(0, Math.min(59, s));

    // Convert to milliseconds
    const totalMs = (clampedH * 3600 + clampedM * 60 + clampedS) * 1000;
    
    setInitialTime(totalMs);
    setCurrentTime(totalMs);
    setIsRunning(false);

    // Update inputs to normalized values
    setInputValues({
      h: clampedH.toString().padStart(2, '0'),
      m: clampedM.toString().padStart(2, '0'),
      s: clampedS.toString().padStart(2, '0')
    });
  };

  const handlePresetClick = (seconds: number) => {
    const ms = seconds * 1000;
    setInitialTime(ms);
    setCurrentTime(ms);
    setIsRunning(false);
    
    const formatted = formatTime(ms);
    setInputValues({
      h: formatted.hours,
      m: formatted.minutes,
      s: formatted.seconds
    });
  };

  const handleInputChange = (field: 'h' | 'm' | 's', value: string) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    // Limit length
    if (value.length > 2) return;
    
    setInputValues(prev => ({ ...prev, [field]: value }));
  };

  // Helper to parse HH:MM into seconds for presets
  const parsePreset = (timeStr: string) => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1]; // MM:SS
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]; // HH:MM:SS
    return 0;
  };

  const presets = ["00:12", "00:46", "02:30", "04:12"];

  // Display parts
  const timeDisplay = formatTime(currentTime);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-800 via-slate-900 to-black flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Phone Frame Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative w-full max-w-[430px] aspect-[9/16] bg-slate-950 rounded-[3rem] shadow-2xl border-[6px] border-slate-800 overflow-hidden flex flex-col ring-1 ring-white/10"
        style={{ boxShadow: "0 0 60px -15px rgba(0,0,0,0.7), inset 0 0 20px rgba(0,0,0,0.8)" }}
      >
        {/* Glossy Reflection Overlay */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-10" />

        {/* Content Container */}
        <div className="flex flex-col h-full w-full relative z-20 p-6 text-slate-100">
          
          {/* Top Section: Label */}
          <div className="flex-none pt-8 flex flex-col items-center justify-center opacity-60">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-widest font-medium text-slate-400">
              <Clock className="w-3 h-3" />
              <span>Dev Session Timer</span>
            </div>
          </div>

          {/* Middle Section: Hero Time Display */}
          <div className="flex-1 flex items-center justify-center flex-col">
            <div className="flex items-baseline justify-center font-mono font-bold tracking-tighter text-white drop-shadow-lg select-none">
              {/* Hours */}
              <DigitDisplay value={timeDisplay.hours} label="HR" />
              <span className="text-4xl sm:text-6xl text-slate-500 mx-1 sm:mx-2 -translate-y-4">:</span>
              {/* Minutes */}
              <DigitDisplay value={timeDisplay.minutes} label="MIN" />
              <span className="text-4xl sm:text-6xl text-slate-500 mx-1 sm:mx-2 -translate-y-4">:</span>
              {/* Seconds */}
              <DigitDisplay value={timeDisplay.seconds} label="SEC" isHighlighted />
            </div>
            {/* Milliseconds - Smaller display below or inline */}
            <div className="flex items-center justify-center mt-2 font-mono text-slate-500 font-medium tracking-widest">
               <span className="text-2xl tabular-nums text-emerald-500">{timeDisplay.ms}</span>
               <span className="text-[0.6rem] uppercase ml-1 mt-1">MS</span>
            </div>
          </div>

          {/* Bottom Section: Inputs & Controls */}
          <div className="flex-none pb-10 space-y-8">
            
            {/* Time Input & Set Button */}
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-lg font-mono">
                <TimeInput 
                  value={inputValues.h} 
                  onChange={(e) => handleInputChange('h', e.target.value)} 
                  placeholder="HH"
                />
                <span className="text-slate-600">:</span>
                <TimeInput 
                  value={inputValues.m} 
                  onChange={(e) => handleInputChange('m', e.target.value)} 
                  placeholder="MM"
                />
                <span className="text-slate-600">:</span>
                <TimeInput 
                  value={inputValues.s} 
                  onChange={(e) => handleInputChange('s', e.target.value)} 
                  placeholder="SS"
                />
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSetTime}
                  className="ml-4 px-4 py-1 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors uppercase tracking-wide border border-slate-700"
                >
                  Set
                </motion.button>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap justify-center gap-2">
                {presets.map((preset) => (
                  <motion.button
                    key={preset}
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePresetClick(parsePreset(preset))}
                    className="px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg transition-colors"
                  >
                    {preset}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center justify-center space-x-8">
              {/* Reset Button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: -10 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleReset}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shadow-lg"
                aria-label="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>

              {/* Play/Pause Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStartPause}
                className={cn(
                  "w-20 h-20 flex items-center justify-center rounded-full shadow-2xl transition-colors border-4 border-slate-900",
                  isRunning 
                    ? "bg-amber-500 text-slate-900 hover:bg-amber-400" 
                    : "bg-emerald-500 text-slate-900 hover:bg-emerald-400"
                )}
                aria-label={isRunning ? "Pause" : "Play"}
              >
                <AnimatePresence mode="wait">
                  {isRunning ? (
                    <motion.div
                      key="pause"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Pause className="w-8 h-8 fill-current" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="play"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Play className="w-8 h-8 fill-current ml-1" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Placeholder for symmetry or future feature (e.g. lap) - kept hidden/empty for now to keep clean as requested */}
              <div className="w-12 h-12" /> 
            </div>
          </div>
        </div>

        {/* Decorative Home Indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-800 rounded-full opacity-50" />
      </motion.div>
    </div>
  );
}

// --- Subcomponents ---

function DigitDisplay({ value, label, isHighlighted = false }: { value: string; label: string; isHighlighted?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden h-20 sm:h-24 w-[4.5rem] sm:w-[5.5rem] flex justify-center">
         {/* Animate the digits changing */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "absolute text-6xl sm:text-7xl font-light tabular-nums",
              isHighlighted ? "text-white" : "text-slate-200"
            )}
          >
            {value}
          </motion.span>
        </AnimatePresence>
        </div>
      <span className="text-[0.6rem] sm:text-xs font-bold tracking-widest text-slate-600 mt-2">
        {label}
      </span>
    </div>
  );
}

function TimeInput({ value, onChange, placeholder }: { value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-10 bg-transparent text-center border-b-2 border-slate-700 focus:border-emerald-500 text-slate-300 focus:text-emerald-400 outline-none transition-colors placeholder:text-slate-700"
      maxLength={2} 
    />
  );
}
