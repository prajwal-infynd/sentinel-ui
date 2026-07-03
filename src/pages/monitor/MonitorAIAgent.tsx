import { useState } from "react";
import { Bot, Sparkles, Send, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SUGGESTED_QUESTIONS = [
  "Why is Renault SAS high risk?",
  "Show companies deteriorating this month",
  "Which customers should I review first?",
  "Show all companies with sanctions exposure",
  "Which customers have multiple warning signals?",
  "Summarise my portfolio risk for the board"
];

interface ChatMessage {
  role: "agent" | "user";
  content: string;
}

export default function MonitorAIAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "agent",
      content: "Hi — I'm your AI Monitoring Agent. I continuously analyse your 38,000 monitored companies. Ask me anything about your portfolio risk, or pick a suggested question below."
    }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: "user", content: text }]);
    setInputValue("");
    
    // Mock response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "agent", 
        content: "I'm currently running in demo mode. In a live environment, I would analyze your portfolio and provide a detailed response to that query." 
      }]);
    }, 1000);
  };

  return (
    <div className="flex gap-6 max-w-[1200px] mx-auto h-[calc(100vh-220px)] mt-4">
      
      {/* Left Sidebar - Suggested Questions */}
      <div className="w-[300px] shrink-0">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 h-full flex flex-col">
          <h3 className="text-[13px] font-bold text-slate-900 flex items-center gap-2 mb-4 px-1">
            <Sparkles className="w-4 h-4 text-blue-600" />
            Suggested questions
          </h3>
          <div className="space-y-1 overflow-y-auto pr-1">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="w-full text-left px-3 py-3 rounded-lg text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors border border-transparent hover:border-slate-100"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Area - Chat Interface */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Chat Header */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-4 bg-white shrink-0">
          <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-sm border border-pink-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">AI Monitoring Agent</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Online</span>
              <span className="text-[11px] text-slate-400 mx-1">•</span>
              <span className="text-[11px] text-slate-500">Analysing 38,000 entities</span>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                msg.role === "agent" ? "bg-white border border-slate-200 text-pink-600" : "bg-indigo-600 text-white"
              }`}>
                {msg.role === "agent" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed shadow-sm ${
                msg.role === "agent" 
                  ? "bg-white border border-slate-100 text-slate-700" 
                  : "bg-indigo-600 text-white"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Chat Input */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputValue);
            }}
            className="flex gap-2"
          >
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your portfolio risk..." 
              className="flex-1 bg-slate-50 border-slate-200 h-11 px-4 text-[13px] focus-visible:ring-pink-500 rounded-xl shadow-inner"
            />
            <Button type="submit" disabled={!inputValue.trim()} className="h-11 w-11 p-0 bg-pink-600 hover:bg-pink-700 shadow-sm rounded-xl shrink-0 transition-colors">
              <Send className="w-4 h-4 text-white ml-0.5" />
            </Button>
          </form>
        </div>

      </div>
    </div>
  );
}
