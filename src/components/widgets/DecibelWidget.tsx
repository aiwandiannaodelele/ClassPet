"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DecibelWidget({ onClose }: { onClose: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0); // 0-100
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const requestRef = useRef<number>(0);

  const startListening = async () => {
    try {
      // Ensure any previous context is closed
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        await audioContextRef.current.close();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
      
      setIsListening(true);
      // Start the loop
      requestRef.current = requestAnimationFrame(updateVolume);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("无法访问麦克风，请检查权限设置");
    }
  };

  const stopListening = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(console.error);
    }
    setIsListening(false);
    setVolume(0);
  };

  const updateVolume = () => {
    if (!analyserRef.current || !dataArrayRef.current) return;
    
    // We must read the data in the animation loop
    analyserRef.current.getByteFrequencyData(dataArrayRef.current as any);
    let sum = 0;
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i];
    }
    const average = sum / dataArrayRef.current.length;
    // Map average (0-255) to 0-100 scale roughly
    const scaledVolume = Math.min(100, Math.max(0, (average / 128) * 100));
    setVolume(scaledVolume);
    
    // The recursive call must be independent of the React state closure `isListening`
    // otherwise it stops immediately on the next frame due to stale closure.
    requestRef.current = requestAnimationFrame(updateVolume);
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  // Determine color based on volume (Green -> Yellow -> Red)
  const getVolumeColor = () => {
    if (volume < 30) return "bg-green-500";
    if (volume < 70) return "bg-primary";
    return "bg-red-500";
  };

  // Determine rotation for the needle (-90 to 90 degrees)
  const needleRotation = -90 + (volume / 100) * 180;

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 top-40 right-10 shadow-2xl cursor-move"
    >
      <Card className="w-64 overflow-hidden border-2 border-slate-200">
        <div className="bg-slate-100 px-3 py-2 flex justify-between items-center border-b">
          <span className="font-semibold text-sm text-slate-700 flex items-center gap-2">
            <Mic className="w-4 h-4 text-slate-500" />
            分贝仪
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-200" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 bg-white cursor-default flex flex-col items-center">
          
          {/* Dashboard/Gauge UI */}
          <div className="relative w-48 h-24 overflow-hidden mb-4 mt-2">
            {/* Semi-circle background */}
            <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[20px] border-slate-100" />
            
            {/* Colored arc segments */}
            <svg className="absolute top-0 left-0 w-48 h-48" viewBox="0 0 100 100">
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="15" strokeDasharray="45 100" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f59e0b" strokeWidth="15" strokeDasharray="45 100" strokeDashoffset="-45" />
              <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="15" strokeDasharray="40 100" strokeDashoffset="-90" />
            </svg>

            {/* Needle */}
            <div 
              className="absolute bottom-0 left-1/2 w-1 h-20 bg-slate-800 origin-bottom transform transition-transform duration-100 ease-out"
              style={{ transform: `translateX(-50%) rotate(${needleRotation}deg)` }}
            >
              {/* Needle base */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-slate-800" />
            </div>
          </div>

          <div className="text-2xl font-bold text-slate-700 mb-4">
            {Math.round(volume)} <span className="text-sm font-normal text-slate-500">dB (相对)</span>
          </div>

          <Button 
            variant={isListening ? "destructive" : "default"}
            className="w-full"
            onClick={isListening ? stopListening : startListening}
          >
            {isListening ? (
              <><MicOff className="w-4 h-4 mr-2" /> 停止监测</>
            ) : (
              <><Mic className="w-4 h-4 mr-2" /> 开始监测</>
            )}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}