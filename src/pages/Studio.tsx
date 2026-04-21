import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { GlassCard } from "@/components/shared/GlassCard";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { PlaySquare, Star, Clock, CheckCircle2, Play } from "lucide-react";
import { toast } from "sonner";

export default function Studio() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => api.courses.list(),
  });
  const { data: enrollments = [] } = useQuery({
    queryKey: ["enrollments", user?.id],
    enabled: !!user?.id,
    queryFn: () => api.courses.myEnrollments(user!.id),
  });
  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const lastWatched = enrollments[0];
  const lastWatchedCourse = lastWatched ? courses.find((c) => c.id === lastWatched.course_id) : null;

  const enroll = useMutation({
    mutationFn: (courseId: string) => api.courses.enroll(user!.id, courseId),
    onSuccess: () => {
      toast.success("Enrolled");
      qc.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resume = useMutation({
    mutationFn: (courseId: string) => api.courses.touch(user!.id, courseId),
    onSuccess: () => {
      toast.success("Resumed playback");
      qc.invalidateQueries({ queryKey: ["enrollments", user?.id] });
    },
  });

  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
        <span className="text-gradient">Studio</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">Your library of courses, sessions, and creator tools.</p>

      {lastWatchedCourse && (
        <GlassCard variant="strong" className="mt-6 p-5">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <PlaySquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Continue watching</p>
              <h2 className="font-display text-lg font-semibold">{lastWatchedCourse.title}</h2>
              <p className="text-xs text-muted-foreground">{lastWatchedCourse.instructor} · {lastWatched.progress}% complete</p>
            </div>
            <Button onClick={() => resume.mutate(lastWatchedCourse.id)} className="bg-gradient-primary text-primary-foreground">
              <Play className="mr-1 h-4 w-4" /> Resume
            </Button>
          </div>
        </GlassCard>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((c) => {
          const enrolled = enrolledIds.has(c.id);
          return (
            <GlassCard key={c.id} className="flex flex-col p-5 transition hover:border-primary/40">
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-gradient-primary/20 grid place-items-center">
                <PlaySquare className="h-10 w-10 text-primary-glow" />
              </div>
              <h3 className="mt-3 font-display font-semibold">{c.title}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{c.description}</p>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-warning" /> {c.rating}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {Math.round(c.duration_minutes / 60)}h</span>
                <span className="rounded-full bg-secondary/60 px-1.5 py-0.5 uppercase tracking-wider text-[10px]">{c.level}</span>
              </div>
              <Button
                size="sm"
                onClick={() => (enrolled ? resume.mutate(c.id) : enroll.mutate(c.id))}
                disabled={enroll.isPending}
                className={`mt-4 ${enrolled ? "" : "bg-gradient-primary text-primary-foreground"}`}
                variant={enrolled ? "outline" : "default"}
              >
                {enrolled ? <><CheckCircle2 className="mr-1 h-4 w-4" /> Enrolled — open</> : "Enroll"}
              </Button>
            </GlassCard>
          );
        })}
      </div>
    </AppShell>
  );
}