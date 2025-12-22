import React, { useState, useEffect, useRef } from 'react';
import { usePubSub, useMeeting } from '@videosdk.live/react-sdk';
import { Send, MessageSquare } from 'lucide-react';

const ChatPanel = () => {
    const { localParticipant } = useMeeting();
    
    // ✅ FIX: Removed invalid '{ persist: true }' from the hook.
    // The hook automatically handles history retrieval in the 'messages' array.
    const { publish, messages } = usePubSub("CHAT");

    const [input, setInput] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        
        // ✅ CORRECT: 'persist: true' belongs here (in the publish method)
        publish(input, { persist: true });
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-blue-400" />
                <span className="font-semibold text-white">Live Chat</span>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((msg) => {
                    const isLocal = msg.senderId === localParticipant?.id;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-gray-400">
                                    {isLocal ? "You" : msg.senderName}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div 
                                className={`px-3 py-2 rounded-lg max-w-[85%] text-sm break-words ${
                                    isLocal 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                                }`}
                            >
                                {msg.message}
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-gray-900 border-t border-gray-800">
                <div className="flex items-center gap-2 bg-gray-800 rounded-full px-4 py-2 border border-gray-700 focus-within:border-blue-500 transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none focus:outline-none text-sm text-white placeholder-gray-500"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatPanel;