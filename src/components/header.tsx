"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { SmartReportDialog } from "@/components/smart-report-dialog";
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Logo } from "./logo";

export function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {isMobile && <Logo isMobile={true} />}
      </div>
      
      <SmartReportDialog>
        <Button variant="outline" className="bg-transparent">
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          Smart Report
        </Button>
      </SmartReportDialog>
    </header>
  );
}
