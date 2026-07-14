import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "வணக்கம்! நான் UMN AI உதவியாளர். உங்களுக்கு UMN செயலி அங்காடியைப் (App Store) பயன்படுத்துவதில் ஏதேனும் உதவி தேவையா? அல்லது Image URL எப்படி சேர்ப்பது என்று தெரிந்து கொள்ள வேண்டுமா? கீழே உள்ள பரிந்துரை பொத்தான்களை அழுத்தலாம் அல்லது என்னிடம் நேரடியாகக் கேட்கலாம்!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasAiEnabled, setHasAiEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Check if AI is enabled on startup
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        const res = await fetch("/api/ai/enabled");
        const data = await res.json();
        setHasAiEnabled(data.enabled);
      } catch (e) {
        setHasAiEnabled(false);
      }
    };
    checkAiStatus();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          chatHistory: messages,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to reach Gemini AI.");
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: "model", text: data.response }]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "மன்னிக்கவும், AI சேவையைத் தொடர்பு கொள்வதில் பிழை ஏற்பட்டது. உங்கள் .env கோப்பில் GEMINI_API_KEY சரியாக உள்ளதா என்பதை உறுதிப்படுத்திக் கொள்ளவும்.",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  const suggestions = [
    "Image URL எப்படி சேர்ப்பது?",
    "செயலியை நிறுவுவது எப்படி (APK)?",
    "Console-இல் லாகின் செய்வது எப்படி?",
    "இங்கு என்னென்ன செயலிகள் உள்ளன?",
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans select-none" id="ai-chatbot-root">
      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-full shadow-xl shadow-green-500/20 cursor-pointer border border-green-400/20 relative"
      >
        <Bot className="w-5 h-5 animate-bounce" />
        <span className="text-sm font-bold tracking-tight">UMN AI</span>
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
          Live
        </span>
      </motion.button>

      {/* Chat Window Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="absolute bottom-18 right-0 w-85 sm:w-96 h-[520px] bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 dark:from-zinc-950 dark:to-black text-white flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight flex items-center gap-1.5">
                    UMN AI Companion
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-medium">இயக்குவது Gemini 3.5 Flash</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Warn banner if Gemini key missing */}
            {!hasAiEnabled && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-3 py-1.5 text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>
                  GEMINI_API_KEY இல்லை! Settings &gt; Secrets-இல் சேர்ப்பதை உறுதி செய்க.
                </span>
              </div>
            )}

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50 dark:bg-zinc-950/40">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-green-500 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-150 dark:border-zinc-800/80 rounded-bl-none shadow-sm"
                    }`}
                  >
                    {/* Preserve line breaks for elegant layout */}
                    <div className="whitespace-pre-line font-medium">{msg.text}</div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/80 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-zinc-400 dark:text-zinc-500 flex items-center gap-2 shadow-sm font-medium">
                    <Bot className="w-4 h-4 text-green-500 animate-spin" />
                    <span>UMN AI பதிலளிக்கிறது...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Quick Buttons */}
            {messages.length === 1 && !isTyping && (
              <div className="px-4 py-2 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-900/40">
                <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5">
                  உதவிக்குறிப்புகள் (Suggestions)
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestClick(s)}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[10px] font-bold text-left transition-colors cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(input);
              }}
              className="p-3 border-t border-zinc-150 dark:border-zinc-850 bg-white dark:bg-zinc-950 flex gap-2"
            >
              <input
                type="text"
                placeholder="கேள்விகளைக் கேளுங்கள்..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 border border-transparent focus:border-green-500 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all font-semibold"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
