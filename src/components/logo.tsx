import { LocateFixed } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ isMobile = false }: { isMobile?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-2">
      <div className="rounded-full bg-primary/20 p-2">
        <LocateFixed className="h-6 w-6 text-primary" />
      </div>
      <h1 className={cn(
          "font-headline text-xl font-bold tracking-wider text-primary",
          isMobile && "text-lg"
      )}>
        Simhastha Seeker
      </h1>
    </div>
  );
}
