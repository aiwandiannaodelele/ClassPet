"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Play, Square, RotateCcw, Timer, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TimerWidget({ onClose }: { onClose: () => void }) {
  const [time, setTime] = useState(300); // default 5 minutes (300 seconds)
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<"countdown" | "stopwatch">("countdown");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        setTime((prev) => {
          if (mode === "countdown" && prev <= 1) {
            setIsRunning(false);
            return 0;
          }
          return mode === "stopwatch" ? prev + 1 : prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, mode]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTime(mode === "countdown" ? 300 : 0);
  };

  const handleModeChange = (newMode: "countdown" | "stopwatch") => {
    if (newMode === mode) return;
    setMode(newMode);
    setIsRunning(false);
    setTime(newMode === "countdown" ? 300 : 0);
  };

  const formatTimeArray = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    return {
      h1: Math.floor(h / 10).toString(),
      h2: (h % 10).toString(),
      m1: Math.floor(m / 10).toString(),
      m2: (m % 10).toString(),
      s1: Math.floor(s / 10).toString(),
      s2: (s % 10).toString(),
    };
  };

  const t = formatTimeArray(time);

  const adjustTime = (amount: number) => {
    if (isRunning) return;
    setTime((prev) => Math.max(0, prev + amount));
  };

  const DigitColumn = ({ value, step }: { value: string, step: number }) => (
    <div className="flex flex-col items-center gap-1">
      {!isRunning && mode === "countdown" ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-8 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50"
          onClick={() => adjustTime(step)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      ) : (
        <div className="h-6" />
      )}
      <div className="flex justify-center items-center font-mono font-bold text-slate-800 text-5xl w-10">
        {value}
      </div>
      {!isRunning && mode === "countdown" ? (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-8 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50"
          onClick={() => adjustTime(-step)}
        >
          <Minus className="h-4 w-4" />
        </Button>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 shadow-xl top-24 right-24 cursor-move"
    >
      <Card className="w-[360px] overflow-hidden border-2 border-amber-100 bg-white flex flex-col rounded-xl">
        <div className="bg-amber-50/50 px-3 py-2 flex justify-between items-center border-b border-amber-100">
          <span className="font-semibold text-sm text-amber-900 flex items-center gap-2">
            <Timer className="w-4 h-4 text-amber-600" />
            计时器
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-amber-100 text-amber-700" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center cursor-default">
          
          {/* Top Toggle */}
          <Tabs defaultValue="countdown" onValueChange={(v) => handleModeChange(v as any)} className="w-48 mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="countdown">倒计时</TabsTrigger>
              <TabsTrigger value="stopwatch">秒表</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Time Display */}
          <div className="flex items-center justify-center gap-1 mb-6">
            {/* Hours */}
            <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
              <DigitColumn value={t.h1} step={36000} />
              <DigitColumn value={t.h2} step={3600} />
            </div>
            
            <span className="font-mono font-bold text-slate-300 flex items-center justify-center text-3xl w-4 -mt-2">:</span>
            
            {/* Minutes */}
            <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
              <DigitColumn value={t.m1} step={600} />
              <DigitColumn value={t.m2} step={60} />
            </div>
            
            <span className="font-mono font-bold text-slate-300 flex items-center justify-center text-3xl w-4 -mt-2">:</span>
            
            {/* Seconds */}
            <div className="flex bg-slate-50 rounded-xl p-1.5 border border-slate-100">
              <DigitColumn value={t.s1} step={10} />
              <DigitColumn value={t.s2} step={1} />
            </div>
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-center gap-6 w-full">
            <Button 
              className={`h-14 w-14 rounded-full shadow-md transition-transform hover:scale-105 ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
              onClick={toggleTimer}
            >
              {isRunning ? <Square className="h-5 w-5 fill-current" /> : <Play className="h-6 w-6 ml-1 fill-current" />}
            </Button>

            <Button 
              variant="outline" 
              size="icon"
              className="h-10 w-10 rounded-full border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 absolute right-6 bottom-6" 
              onClick={resetTimer}
              title="重置"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}