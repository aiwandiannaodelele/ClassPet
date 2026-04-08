"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React from "react";

export const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-4 md:px-8 lg:px-12",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Spotlight = ({
  className,
  fill,
}: {
  className?: string;
  fill?: string;
}) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="2731.05"
          rx="1924.71"
          ry="2731.05"
          fill={fill || "url(#gradient)"}
        ></ellipse>
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix"></feFlood>
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          ></feBlend>
          <feGaussianBlur
            stdDeviation="151"
            result="effect1_foregroundBlur_1065_8"
          ></feGaussianBlur>
        </filter>
        <linearGradient
          id="gradient"
          x1="0"
          y1="0"
          x2="1"
          y2="1"
        >
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "FAST",
  waveOpacity = 0.5,
  ...attrs
}: {
  children?: any;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "SLOW" | "MEDIUM" | "FAST";
  waveOpacity?: number;
  [key: string]: any;
}) => {
  const colorsArray = colors || ["#F59E0B", "#FBBF24", "#FCD34D"];
  
  const getSpeed = () => {
    switch (speed) {
      case "SLOW":
        return 0.001;
      case "MEDIUM":
        return 0.002;
      case "FAST":
        return 0.003;
      default:
        return 0.001;
    }
  };

  return (
    <div
      className={cn(
        "h-screen flex flex-col items-center justify-center",
        containerClassName
      )}
      {...attrs}
    >
      <main className="relative flex flex-col items-center justify-center w-full h-full z-[1]">
        {children}
      </main>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-gradient">
              <stop offset="0%" stopColor={colorsArray[0]} />
              <stop offset="50%" stopColor={colorsArray[1]} />
              <stop offset="100%" stopColor={colorsArray[2]} />
            </linearGradient>
          </defs>
          {Array.from({ length: 5 }).map((_, i) => (
            <path
              key={i}
              d={`M${i * 200} ${300 + Math.sin(i) * 50} Q${150 + i * 200} ${200 + Math.cos(i) * 100} ${300 + i * 200} ${300 + Math.sin(i) * 50} T${600 + i * 200} ${300 + Math.sin(i) * 50}`}
              stroke={`url(#wave-gradient)`}
              strokeWidth={waveWidth || 20}
              fill="none"
              opacity={waveOpacity}
            >
              <animate
                attributeName="d"
                dur={`${20 / getSpeed()}s`}
                repeatCount="indefinite"
                values={`
                  M${i * 200} ${300 + Math.sin(i) * 50} Q${150 + i * 200} ${200 + Math.cos(i) * 100} ${300 + i * 200} ${300 + Math.sin(i) * 50} T${600 + i * 200} ${300 + Math.sin(i) * 50};
                  M${i * 200} ${250 + Math.cos(i) * 50} Q${150 + i * 200} ${350 + Math.sin(i) * 100} ${300 + i * 200} ${250 + Math.cos(i) * 50} T${600 + i * 200} ${250 + Math.cos(i) * 50};
                  M${i * 200} ${300 + Math.sin(i) * 50} Q${150 + i * 200} ${200 + Math.cos(i) * 100} ${300 + i * 200} ${300 + Math.sin(i) * 50} T${600 + i * 200} ${300 + Math.sin(i) * 50}
                `}
              />
            </path>
          ))}
        </svg>
      </div>
    </div>
  );
};

export const BackgroundBeams = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "fixed inset-0 h-full w-full pointer-events-none z-0",
        className
      )}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            y: Math.random() * 1000 - 500,
            x: Math.random() * 2000 - 1000,
          }}
          animate={{
            opacity: [0, 0.5, 0],
            y: [null, Math.random() * 500 - 250],
          }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            position: "absolute",
            width: Math.random() * 200 + 50,
            height: Math.random() * 2 + 1,
            background: "linear-gradient(90deg, transparent, #F59E0B, transparent)",
            filter: "blur(10px)",
          }}
        />
      ))}
    </div>
  );
};
