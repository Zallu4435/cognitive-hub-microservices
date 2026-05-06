"use client";

import { useState, useRef, useEffect } from "react";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api-client";

export default function ChatPage() {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(e as unknown as React.FormEvent);
        }
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput("");
        setIsLoading(true);

        try {
            // Securely proxy the request to the AI service (mapped to 'insights' in our proxy map)
            const res = await apiClient.post("/insights/chat", { message: userMessage });

            setMessages(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (err: any) {
            const detail = err?.response?.data?.detail || err?.message || "Unable to connect to AI Core.";
            setMessages(prev => [...prev, { role: 'ai', text: `⚠ ${detail}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-8rem)] flex flex-col pb-6 relative">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" />

            <div className="mb-10 relative z-10 animate-fade-in">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-surface/50 border border-primary/30 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <span className="w-2 h-2 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
                    <span className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                        Module :: Neural Interface
                    </span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                    Terminal Link
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl font-light">Direct connection to the Gemini cognitive engine. Input queries or brainstorming parameters.</p>
            </div>

            <div className="flex-1 flex flex-col bg-surface/30 backdrop-blur-2xl border border-white/5 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden relative group animate-slide-up min-h-[500px]">
                
                {/* Decorative glow inside chat box */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-700 group-hover:bg-primary/20" />

                {/* Decorative HUD Elements */}
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl pointer-events-none z-20" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-primary/40 rounded-br-3xl pointer-events-none z-20" />

                {/* Header */}
                <div className="p-5 border-b border-white/10 bg-surface/50 backdrop-blur-md flex items-center justify-between relative z-10 shadow-inner">
                    <div className="flex items-center">
                        <div className="relative flex h-3 w-3 mr-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-success shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                        </div>
                        <h2 className="font-mono font-bold text-xs uppercase tracking-widest text-white flex items-center gap-3">
                            Gemini AI Engine 
                            <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">SECURE_LINK</span>
                        </h2>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">
                        SYS.PORT: 443
                    </div>
                </div>

                {/* Chat History */}
                <div className={`flex-1 overflow-y-auto p-6 md:p-8 relative z-10 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex flex-col ${messages.length === 0 ? '' : 'space-y-8'}`}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-zinc-500 space-y-6 relative overflow-hidden w-full rounded-2xl">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />
                            <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-2 shadow-inner relative z-10">
                                <span className="text-4xl text-primary/60">⚡</span>
                            </div>
                            <p className="text-center font-mono text-sm uppercase tracking-widest relative z-10">Awaiting User Input Sequence...</p>
                        </div>
                    ) : (
                        messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.role === 'ai' && (
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center mr-4 flex-shrink-0 mt-1 shadow-inner relative group/icon">
                                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-50 group-hover/icon:opacity-100 transition-opacity" />
                                        <span className="text-lg relative z-10">🧠</span>
                                    </div>
                                )}
                                <div className={`max-w-[85%] md:max-w-[75%] p-5 rounded-2xl text-sm leading-relaxed relative overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.2)] ${msg.role === 'user'
                                    ? 'bg-primary/20 border border-primary/40 text-white rounded-tr-sm backdrop-blur-md'
                                    : 'bg-surface/50 border border-white/10 text-zinc-300 rounded-tl-sm backdrop-blur-md'
                                    }`}>
                                    {msg.role === 'user' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 pointer-events-none" />
                                    )}
                                    {msg.role === 'ai' && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                                    )}
                                    <div className="relative z-10 whitespace-pre-wrap font-light">{msg.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex justify-start items-start animate-fade-in">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center mr-4 flex-shrink-0 mt-1 shadow-inner relative">
                                <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md opacity-100 animate-pulse" />
                                <span className="text-lg relative z-10">🧠</span>
                            </div>
                            <div className="bg-surface/50 border border-white/10 text-zinc-400 p-5 rounded-2xl rounded-tl-sm text-sm flex items-center space-x-3 backdrop-blur-md relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-accent" />
                                <span className="font-mono text-xs uppercase tracking-widest text-primary mr-2 relative z-10">Processing</span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce shadow-[0_0_5px_rgba(99,102,241,0.8)]" style={{ animationDelay: "0ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce shadow-[0_0_5px_rgba(99,102,241,0.8)]" style={{ animationDelay: "150ms" }}></span>
                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce shadow-[0_0_5px_rgba(99,102,241,0.8)]" style={{ animationDelay: "300ms" }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-5 border-t border-white/10 bg-surface/60 backdrop-blur-xl relative z-10 shadow-[0_-8px_32px_rgba(0,0,0,0.2)]">
                    <form onSubmit={sendMessage} className="flex gap-4">
                        <div className="relative flex-1">
                            <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-primary font-mono text-sm font-bold">{">"}</span>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="INPUT QUERY PARAMETERS..."
                                className="w-full bg-background/50 border border-white/10 rounded-xl pl-10 pr-5 py-4 text-white font-mono text-sm tracking-wide focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30 transition-all shadow-inner placeholder:text-zinc-600 placeholder:font-mono resize-none overflow-y-auto min-h-[56px] max-h-[200px]"
                                rows={1}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            variant="primary"
                            className="px-6 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] border-primary/40 hover:border-primary/70 relative group overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="font-mono text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Transmit</span>
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
