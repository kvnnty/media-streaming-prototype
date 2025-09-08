"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { Send, Users, Wifi, WifiOff, MessageCircle } from "lucide-react";
import { Stream } from "@/lib/api";

interface ChatProps {
  stream: Stream;
  isStreamEnded?: boolean;
  className?: string;
}

export function Chat({ stream, className = "" }: ChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();
  const { messages, viewerCount, isLoading, isConnected, sendMessage } = useChat(stream.id.toString());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    sendMessage(newMessage);
    setNewMessage("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={`flex flex-col h-full bg-card border border-border rounded-lg ${className}`}>
      {/* Chat header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Live Chat</h3>
            <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 mr-1" />
                  Connected
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1" />
                  Connecting...
                </>
              )}
            </Badge>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-1" />
            {viewerCount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chat...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet</p>
                <p className="text-xs text-muted-foreground">Be the first to say hello!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="flex items-start space-x-3">
                  <Avatar className="w-6 h-6 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">{message.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline space-x-2">
                      <span className="font-medium text-sm text-primary">{message.username}</span>
                      <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                    </div>
                    <p className="text-sm text-foreground break-words">{message.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message input */}
      <div className="p-4 border-t border-border">
        {stream.actual_end && new Date(stream.actual_end).getTime() < Date.now() ? (
          <div className="text-center text-sm text-muted-foreground">
            <p>Stream ended!</p>
          </div>
        ) : user ? (
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isConnected ? "Type a message..." : "Connecting to chat..."}
              className="flex-1"
              maxLength={200}
              disabled={!isConnected}
            />
            <Button type="submit" size="sm" disabled={!newMessage.trim() || !isConnected}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <p>Sign in to join the chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
