import { cn } from "@/lib/utils";

export function KunaiMark({ className }: { className?: string }) {
  return <svg aria-hidden="true" className={cn("h-8 w-3 text-[#b8872f]", className)} viewBox="0 0 52 72" fill="none"><path d="M25.9 3.3 35 18.8 29.2 22l-.6 22.7 8.3 16.2-11 7.5-11-7.5 8.3-16.2L22.6 22l-5.8-3.2 9.1-15.5Z" fill="currentColor" /><path d="m25.9 17.9 3.5 6-3.5 17.6-3.5-17.6 3.5-6Z" fill="#fffdf8" opacity=".96" /></svg>;
}

export default function AnilyfeMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return <span className={cn("anilyfe-light-mark", className)}><span>AN</span><KunaiMark className="-mx-0.5" /><span>{compact ? "LYFE" : "LYFE"}</span></span>;
}
