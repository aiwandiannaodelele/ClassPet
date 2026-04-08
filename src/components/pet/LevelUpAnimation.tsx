"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface LevelUpAnimationProps {
  studentName: string;
  petName: string;
  newLevel: number;
  onAnimationComplete?: () => void;
}

export function LevelUpAnimation({ studentName, petName, newLevel, onAnimationComplete }: LevelUpAnimationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onAnimationComplete?.();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm"
        >
          {/* 放射状背景 */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ rotate: i * 30, scaleX: 0 }}
                animate={{ 
                  rotate: i * 30,
                  scaleX: 1,
                }}
                transition={{ 
                  duration: 0.8,
                  delay: i * 0.05,
                  ease: "easeOut"
                }}
                className="absolute inset-0 origin-center"
              >
                <div className="w-1 h-[200%] bg-amber-200 mx-auto" />
              </motion.div>
            ))}
          </div>

          {/* 星星装饰 */}
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
                x: Math.random() * 400 - 200,
                y: Math.random() * 400 - 200,
              }}
              transition={{
                duration: 2,
                delay: 0.5 + Math.random() * 1,
                repeat: Infinity,
                repeatDelay: 1 + Math.random() * 2,
              }}
              className="absolute text-amber-300 text-2xl"
            >
              ⭐
            </motion.div>
          ))}

          {/* 中心内容 */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ 
              scale: [0.5, 1.2, 1],
              opacity: 1,
            }}
            transition={{
              duration: 1,
              ease: "easeOut",
            }}
            className="relative z-10 text-center"
          >
            {/* LEVEL UP 文字 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: 0, 
                opacity: 1,
              }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-6xl font-bold text-amber-500 drop-shadow-sm">
                升级啦！
              </h1>
            </motion.div>

            {/* 宠物头像 */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ 
                scale: 1,
                rotate: [0, 5, -5, 0],
              }}
              transition={{ 
                delay: 0.5,
                duration: 0.8,
                rotate: {
                  repeat: Infinity,
                  repeatDelay: 3,
                }
              }}
              className="w-48 h-48 mx-auto mb-6 rounded-full bg-amber-400 p-1 shadow-xl shadow-amber-500/20"
            >
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-8xl">
                🐕
              </div>
            </motion.div>

            {/* 等级徽章 */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
              }}
              transition={{ 
                delay: 0.8,
                type: "spring",
                stiffness: 200,
              }}
              className="absolute -bottom-2 -right-4 w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
            >
              <span className="text-white font-bold text-2xl">{newLevel}</span>
            </motion.div>

            {/* 提示文字 */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-amber-200 text-lg mt-8"
            >
              恭喜 <span className="font-bold text-amber-300">{studentName}</span> 的宠物升到新等级！
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
