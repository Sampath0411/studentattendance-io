import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

const botResponses: Record<string, string> = {
  hello: "Hi there! 👋 Welcome to the AU Student Attendance Portal. How can I help you?",
  hi: "Hello! 👋 I'm here to help you navigate the Student Attendance Portal. What would you like to know?",
  what: "This is the **Student Attendance Portal** for AU College of Engineering, Visakhapatnam. Students can check their attendance, and admins can manage records for their sections.",
  how: "Simply select your section, then choose **Student Login** to view your attendance or **Admin Login** to manage records. It's that easy! 🎯",
  student: "Students can log in with their registration number and password to view attendance records, check today's classes, and track their attendance percentage. 📊",
  admin: "Admins can mark attendance, add students, view records, export data as Excel/PDF, and manage their section's timetable. 🛠️",
  section: "We support sections **A2 through A9** and **Women's College**. Each section has its own independent admin, subjects, and student data.",
  attendance: "Attendance is tracked per subject per day. Students can view their overall percentage and per-subject breakdown. Admins can mark and export records. ✅",
  export: "Admins can export attendance records as **Excel (.xlsx)** or **PDF** files from the Attendance Records tab in the dashboard. 📁",
  timetable: "Each section has its own timetable. Students can see today's classes on their dashboard, and the full weekly timetable is available too. 📅",
  pwa: "Yes! This app works as a **Progressive Web App**. You can install it on your phone and use it like a native app — even offline! 📱",
  offline: "The app supports **offline mode** through service workers. Once loaded, you can access cached content even without internet. 🔌",
  features: "Key features include: 📋 Attendance tracking, 📊 Dashboard analytics, 📁 Excel/PDF export, 📱 PWA support, 🔔 Notifications, and section-wise data isolation.",
  help: "I can help with: \n• How to login\n• App features\n• Section info\n• Attendance tracking\n• Export options\n• PWA installation\n\nJust ask! 😊",
  thanks: "You're welcome! 😊 Feel free to ask if you need anything else.",
  bye: "Goodbye! Have a great day! 👋✨",
};

function getBotResponse(input: string): string {
  const lower = input.toLowerCase().trim();
  for (const [key, response] of Object.entries(botResponses)) {
    if (lower.includes(key)) return response;
  }
  return "I can help you with information about this attendance portal! Try asking about **features**, **how to login**, **sections**, **attendance**, or **export** options. 😊";
}

interface Message {
  id: number;
  text: string;
  isBot: boolean;
}

const ChatBotBubble = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, text: "Hi! 👋 I'm your attendance portal assistant. Ask me anything about this app!", isBot: true },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botMsg: Message = { id: Date.now() + 1, text: getBotResponse(input), isBot: true };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Floating Bubble */}
      <motion.button
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(99,102,241,0.4)] flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{ rotate: isOpen ? 90 : 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse ring */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full border-2 border-primary/50"
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 max-h-[28rem] rounded-2xl glass-elevated border border-border/50 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-border/30 bg-primary/10">
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  <MessageCircle className="w-4 h-4 text-primary" />
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-foreground">AU Portal Assistant</p>
                  <p className="text-xs text-muted-foreground">Always online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-72 scrollbar-hide">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.isBot ? "justify-start" : "justify-end"}`}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i === messages.length - 1 ? 0.1 : 0 }}
                >
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                      msg.isBot
                        ? "bg-card border border-border/30 text-foreground rounded-bl-md"
                        : "bg-primary text-primary-foreground rounded-br-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/30 bg-card/50">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about the portal..."
                  className="flex-1 bg-background/50 border border-border/30 rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <Button type="submit" size="sm" className="rounded-xl px-3 h-8">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatBotBubble;
