"use client"

import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Card } from "../ui/card";
import { ChatSession } from "@/interface/chat.interface";

export const ChatSidebar = ({ chatSessions }: { chatSessions: ChatSession[] }) => (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 lg:p-6 border-b border-gray-200">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-2">Chat Sessions</h2>
        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 p-3 lg:p-4 max-h-[calc(100vh-64px)] scroll-auto">
        <div className="space-y-2">
          {chatSessions.map((session) => (
            <Card key={session.id} className="p-3 lg:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
              <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{session.title}</h3>
              <p className="text-xs text-gray-500 mb-2 truncate">{session.lastMessage}</p>
              <p className="text-xs text-gray-400">{session.timestamp.toLocaleDateString()}</p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )