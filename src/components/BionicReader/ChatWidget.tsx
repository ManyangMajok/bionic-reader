import React, { useState, useRef, useEffect } from 'react';
import { useBionicReader } from '../../context/BionicReaderContext';
import { MessageCircle, X, Send, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import ReactMarkdown from 'react-markdown';

export const ChatWidget = () => {
  const { 
    processedText, 
    isChatOpen, 
    setIsChatOpen, 
    chatMessages, 
    sendChatMessage, 
    isChatLoading 
  } = useBionicReader();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Don't show chat if no file is loaded
  if (!processedText) return null;

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isChatLoading) return;

    const question = inputValue;
    setInputValue(""); // Clear input immediately
    await sendChatMessage(question);
  };

  return (
    <>
      {/* 1. Floating Action Button (FAB) */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-xl transition-all duration-300 z-50 flex items-center justify-center ${
          isChatOpen 
            ? "bg-red-500 rotate-90 text-white" 
            : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-110"
        }`}
      >
        {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* 2. Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 sm:w-[400px] h-[500px]">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center gap-2">
            <Bot className="w-5 h-5" />
            <h3 className="font-semibold">Document Assistant</h3>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                }`}>
                  {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm prose prose-sm max-w-none'
                }`}>
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            
            {isChatLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                 </div>
                 <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this document..."
              className="flex-1 bg-gray-50 border-0 focus-visible:ring-1 focus-visible:ring-blue-500"
              disabled={isChatLoading}
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!inputValue.trim() || isChatLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </>
  );
};