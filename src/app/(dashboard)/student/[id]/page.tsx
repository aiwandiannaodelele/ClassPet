import { notFound } from "next/navigation";
import { headers } from "next/headers";
import StudentDetailClient from "./client";

interface StudentDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getStudent(id: string) {
  try {
    const headersList = await headers();
    const cookieHeader = headersList.get('cookie');
    const host = headersList.get("x-forwarded-host") || headersList.get("host") || "localhost:3000";
    const proto = headersList.get("x-forwarded-proto") || "http";
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/students/${id}`, { 
      cache: 'no-store',
      headers: cookieHeader ? { cookie: cookieHeader } : undefined
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch student");
    }
    return res.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function StudentDetailPage({ params }: StudentDetailPageProps) {
  const { id } = await params;
  const student = await getStudent(id);

  if (!student) {
    notFound();
  }

  return <StudentDetailClient student={student} />;
}
