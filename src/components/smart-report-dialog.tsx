
"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, MessageCircle, Send, Volume2 } from "lucide-react";
import { chat } from "@/ai/flows/chatbot";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";
import type { Position, Route } from "@/types";

interface Message {
  role: "user" | "model";
  content: string;
  audio?: string;
  id: string;
}

interface ChatbotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userPosition: Position | null;
  onLocateFacility: (facilityId: string) => void;
  onShowDirections: (route: Route) => void;
}

export function ChatbotDialog({ open, onOpenChange, userPosition, onLocateFacility, onShowDirections }: ChatbotDialogProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Jai Shree Mahakal! How can I help you?", id: 'initial' },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  
  useEffect(() => {
    const lastMessage = messages[messages.length -1];
    if (lastMessage?.role === 'model' && lastMessage.audio) {
        if(audioRef.current) {
            audioRef.current.src = lastMessage.audio;
            audioRef.current.play().catch(e => console.error("Audio playback failed", e));
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage: Message = { role: "user", content: input, id: crypto.randomUUID() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const chatHistory = newMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const stream = await chat({ 
        history: chatHistory.slice(0, -1), 
        message: input,
        userPosition: userPosition || undefined,
      });
      
      const modelMessageId = crypto.randomUUID();
      let modelMessage: Message = { role: "model", content: "", id: modelMessageId };
      setMessages(prev => [...prev, modelMessage]);
      
      for await (const chunk of stream) {
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.id === modelMessageId && lastMsg.role === 'model') {
                const newContent = lastMsg.content + (chunk.text || '');
                const newAudio = chunk.audio || lastMsg.audio;
                return [...prev.slice(0, -1), { ...lastMsg, content: newContent, audio: newAudio }];
            }
            return prev;
        });
        
        if (chunk.facilityId) {
            onLocateFacility(chunk.facilityId);
        }
        if (chunk.route) {
            onShowDirections(chunk.route);
            onOpenChange(false);
        }
      }

    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "model",
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        id: crypto.randomUUID(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-transparent">
          <MessageCircle className="mr-2 h-4 w-4" />
          Chatbot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-lg flex flex-col h-[70vh]">
        <DialogHeader>
          <DialogTitle className="font-headline">Simhastha Seeker</DialogTitle>
          <DialogDescription>
            Your AI guide for Simhastha 2028. Ask me anything!
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "model" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 max-w-[80%]",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.audio && (
                        <Volume2 className="h-4 w-4 mt-2 text-muted-foreground" />
                    )}
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && messages[messages.length-1]?.role !== 'model' && (
              <div className="flex items-start gap-3 justify-start">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                  <div className="rounded-lg px-3 py-2 bg-muted">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
            <div className="relative">
                <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="pr-12"
                disabled={isLoading}
                />
                <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                >
                <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <audio ref={audioRef} className="hidden" />
      </DialogContent>
    </Dialog>
  );
}
