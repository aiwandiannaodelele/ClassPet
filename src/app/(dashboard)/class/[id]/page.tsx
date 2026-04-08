import { StudentListContainer } from '@/components/student/StudentListContainer';
import type { Class, Pet, Student } from '@prisma/client';
import { headers } from 'next/headers';

// Define the expected type for a student with a pet
interface StudentWithPet extends Student {
  pet: Pet | null;
}

// Helper function to fetch data with error handling and forward cookies
async function fetchData(url: string) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    
    const res = await fetch(url, { 
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined
    }); 
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

interface ClassPageParams {
  params: {
    id: string;
  };
}

export default async function ClassPage({ params }: ClassPageParams) {
  const { id } = await params;
  
  // In a real app, you might want to construct the base URL dynamically
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const classInfo: Class | null = await fetchData(`${baseUrl}/api/classes/${id}`);
  const students: StudentWithPet[] | null = await fetchData(`${baseUrl}/api/classes/${id}/students`);

  if (!classInfo || !students) {
    return (
      <div className="w-full px-2 md:px-4 py-4">
        <h1 className="text-2xl font-bold text-red-600">加载班级数据失败</h1>
        <p className="text-slate-500">请检查班级ID是否存在或服务是否正常运行。</p>
      </div>
    );
  }

  return (
    <div className="w-full px-2 md:px-4 pt-2">
      <main>
        <StudentListContainer classId={id} initialStudents={students} />
      </main>
    </div>
  );
}
