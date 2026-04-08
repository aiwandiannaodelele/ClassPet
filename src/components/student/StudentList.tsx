'use client';

import { motion } from 'framer-motion';
import { StudentCard } from './StudentCard';
import type { Pet, Student } from '@prisma/client';

import { useContext } from 'react';
import { CardSizeContext } from '@/app/(dashboard)/layout';

interface StudentWithPet extends Student {
  pet: Pet | null;
}

interface StudentListProps {
  students: StudentWithPet[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export function StudentList({ students }: StudentListProps) {
  const { cardSize } = useContext(CardSizeContext);

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-slate-500">这个班级还没有学生哦，快去添加吧！</p>
      </div>
    );
  }

  let gridClass = "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
  if (cardSize === 'small') {
    gridClass = "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10";
  } else if (cardSize === 'large') {
    gridClass = "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`grid ${gridClass} gap-4 md:gap-6`}
    >
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </motion.div>
  );
}
