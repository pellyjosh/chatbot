"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { generateResponse } from "@/ai/flows/generate-response";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new messages
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;

    const newMessage: ChatMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    //Call GenAI to get response
    try {
      const aiResponse = await generateResponse({
        userInput: input,
        conversationHistory: messages,
      });

      const aiMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse.response,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      //setMessages((prevMessages) => [
      //  ...prevMessages,
      //  {
      //    role: "assistant",
      //    content: "Sorry, I'm having trouble generating a response right now. Please try again later.",
      //  },
      //]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div
        className="flex-grow overflow-y-auto p-4"
        ref={chatContainerRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              "mb-2 flex w-full flex-col items-start rounded-md p-3 text-sm",
              message.role === "user"
                ? "bg-user-message self-end text-white"
                : "bg-message-bubble text-foreground"
            )}
          >
            <div className="flex w-full items-center space-x-2">
              <Avatar className="h-8 w-8">
                {message.role === "user" ? (
                  <>
                    <AvatarImage src="https://picsum.photos/id/66/50/50" alt="User Avatar" />
                    <AvatarFallback>U</AvatarFallback>
                  </>
                ) : (
                  <>
                    <AvatarImage src="https://picsum.photos/id/222/50/50" alt="AI Avatar" />
                    <AvatarFallback>AI</AvatarFallback>
                  </>
                )}
              </Avatar>
              <p className="text-base">{message.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="m-4 flex items-center space-x-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-grow rounded-md border-input shadow-sm focus:border-accent focus:ring-accent"
          rows={3}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button onClick={handleSendMessage} variant="outline">
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
