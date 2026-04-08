"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, UserCheck, RefreshCw, Dices } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface RandomPickerWidgetProps {
  onClose: () => void;
  classId: string;
}

export function RandomPickerWidget({ onClose, classId }: RandomPickerWidgetProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(`/api/classes/${classId}/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (error) {
        console.error("Failed to fetch students for random picker", error);
      }
    };
    if (classId) {
      fetchStudents();
    }
  }, [classId]);

  const handlePick = () => {
    if (students.length === 0) return;
    setIsPicking(true);
    
    // Fake rolling effect
    let count = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedStudent(students[randomIndex]);
      count++;
      if (count > 15) {
        clearInterval(interval);
        setIsPicking(false);
      }
    }, 100);
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 top-32 left-24 shadow-2xl cursor-move"
    >
      <Card className="w-64 overflow-hidden border-2 border-slate-200">
        <div className="bg-slate-100 px-3 py-2 flex justify-between items-center border-b">
          <span className="font-semibold text-sm text-slate-700 flex items-center gap-2">
            <Dices className="w-4 h-4 text-slate-500" />
            随机抽选
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-slate-200" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 bg-white cursor-default flex flex-col items-center">
          <div className="h-32 w-full flex items-center justify-center mb-4 bg-slate-50 rounded-xl border border-slate-100">
            {selectedStudent ? (
              <div className={`flex flex-col items-center gap-2 transition-all ${isPicking ? 'scale-110 blur-[1px]' : 'scale-100 blur-0'}`}>
                <Avatar className="h-14 w-14 border-2 border-amber-200 shadow-sm">
                  {selectedStudent.pet?.image && !selectedStudent.pet.image.startsWith('http') && !selectedStudent.pet.image.startsWith('/') ? (
                    <AvatarFallback className="bg-amber-100 text-2xl">{selectedStudent.pet.image}</AvatarFallback>
                  ) : selectedStudent.pet?.image ? (
                    <AvatarImage src={selectedStudent.pet.image} alt={selectedStudent.pet.name} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-amber-100">{selectedStudent.name.substring(0, 1)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-slate-800">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">{selectedStudent.studentNo || "无学号"}</p>
                </div>
              </div>
            ) : (
              <div className="text-slate-400 flex flex-col items-center">
                <UserCheck className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">点击按钮抽取幸运儿</p>
              </div>
            )}
          </div>

          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white" 
            onClick={handlePick}
            disabled={isPicking || students.length === 0}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isPicking ? 'animate-spin' : ''}`} />
            {isPicking ? "抽取中..." : "开始抽取"}
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}