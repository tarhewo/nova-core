import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  category: string;
  duration_minutes: number;
  thumbnail_url: string | null;
  level: string;
  rating: number;
  enrolled_count: number;
}

export interface Enrollment {
  id: string;
  course_id: string;
  user_id: string;
  progress: number;
  last_watched_at: string;
  created_at: string;
}

export const coursesService = {
  list: async (): Promise<Course[]> => {
    const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data as Course[];
  },
  myEnrollments: async (userId: string): Promise<Enrollment[]> => {
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .order("last_watched_at", { ascending: false });
    if (error) throw error;
    return data as Enrollment[];
  },
  enroll: async (userId: string, courseId: string) => {
    const { error } = await supabase.from("enrollments").insert({ user_id: userId, course_id: courseId });
    if (error && !error.message.toLowerCase().includes("duplicate")) throw error;
  },
  touch: async (userId: string, courseId: string) => {
    await supabase
      .from("enrollments")
      .update({ last_watched_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("course_id", courseId);
  },
};