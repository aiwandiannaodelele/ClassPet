"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  tx: number;
  ty: number;
  duration: number;
}

interface ParticleEffectProps {
  isActive: boolean;
  type?: 'positive' | 'negative' | 'levelup';
}

const POSITIVE_COLORS = ['#fbbf24', '#f59e0b', '#34d399', '#10b981']; // Ambers and Emeralds
const NEGATIVE_COLORS = ['#ef4444', '#f87171', '#94a3b8', '#64748b']; // Reds and Slates
const LEVELUP_COLORS = ['#fbbf24', '#f59e0b', '#a855f7', '#8b5cf6', '#ec4899', '#f43f5e']; // Gold, Purple, Pink

export function ParticleEffect({ isActive, type = 'positive' }: ParticleEffectProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (isActive) {
      let colors = POSITIVE_COLORS;
      let particleCount = 15;
      
      if (type === 'negative') {
        colors = NEGATIVE_COLORS;
      } else if (type === 'levelup') {
        colors = LEVELUP_COLORS;
        particleCount = 30; // More particles for level up
      }

      const newParticles = Array.from({ length: particleCount }).map((_, i) => ({
        id: Date.now() + i,
        x: 50, // Start from center (percentage)
        y: 50,
        // Random target position around the center
        // Level up particles spread further
        tx: 50 + (Math.random() * (type === 'levelup' ? 120 : 80) - (type === 'levelup' ? 60 : 40)), 
        ty: 50 + (Math.random() * (type === 'levelup' ? 120 : 80) - (type === 'levelup' ? 60 : 40)),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + (type === 'levelup' ? 6 : 4), // 4px-10px normally, 6px-12px for levelup
        duration: Math.random() * 0.5 + (type === 'levelup' ? 0.8 : 0.5), // longer duration for levelup
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isActive, type]);

  if (!isActive && particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ 
              opacity: 1, 
              scale: 0, 
              left: `${p.x}%`, 
              top: `${p.y}%` 
            }}
            animate={{ 
              opacity: 0, 
              scale: 1, 
              left: `${p.tx}%`, 
              top: `${p.ty}%` 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: p.duration, 
              ease: "easeOut" 
            }}
            className="absolute rounded-full"
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              boxShadow: `0 0 ${p.size}px ${p.color}`
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
