"use client";

import { useState } from "react";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api-client";

export default function NetworkPage() {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("developer");
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [log, setLog] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("loading");
        setLog("SYS.LOG: Emitting event payload to API Gateway...");

        // Constructing the payload that strictly matches our JSON Schema
        // Use the real authenticated user's ID from the session
        const storedUser = typeof window !== 'undefined'
            ? JSON.parse(localStorage.getItem('kh_os_user') || '{}')
            : {};
        const payload = {
            eventId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            data: {
                userId: storedUser.id || 'unknown',
                email,
                role,
            },
        };

        try {
            const res = await apiClient.post("/gateway/users", payload);

            setLog(`SYS.LOG: TRANSMISSION SUCCESS :: DB_ID=${res.data.db_id}`);
            setStatus("success");
            setEmail("");
        } catch (err: any) {
            setLog(`SYS.ERR: TRANSMISSION FAILED :: ${err.message}`);
            setStatus("error");
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 px-4 pb-12 relative min-h-[80vh]">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px] pointer-events-none -z-10 animate-pulse-slow" />
            <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-blob" />

            <div className="mb-12 text-center relative z-10 animate-fade-in">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-surface/50 border border-primary/30 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <span className="w-2 h-2 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
                    <span className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                        Module :: Gateway Interface
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                    Network Protocol
                </h1>
                <p className="text-lg text-zinc-400 max-w-lg mx-auto font-light">Create a new mocked user struct strictly triggering the backend polyglot event pipeline.</p>
            </div>

            <div className="bg-surface/30 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group animate-slide-up">
                
                {/* Decorative glows inside container */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none transition-all duration-700 group-hover:bg-primary/20" />

                {/* Decorative HUD Elements */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-primary/40 rounded-tl-3xl pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-primary/40 rounded-br-3xl pointer-events-none" />
                
                {/* HUD Alignment Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)] opacity-50" />

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-white flex items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full mr-3" />
                            Target Parameters
                        </h2>
                        <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest bg-surface/50 px-2 py-1 rounded border border-white/5">
                            PORT: 3001
                        </span>
                    </div>

                    <InputField
                        label="Identity Hash (Email)"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="test_user@example.com"
                    />

                    <InputField
                        label="System Role Directive"
                        type="text"
                        required
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="e.g. Senior DevOps Engineer"
                    />

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={status === "loading"}
                            variant="primary"
                            size="lg"
                            fullWidth
                            className="h-[54px] shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border-primary/50 hover:border-primary/80 relative overflow-hidden group/btn"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                            {status === "loading" ? (
                                <span className="flex items-center justify-center font-mono text-sm uppercase tracking-widest relative z-10">
                                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Transmitting Payload...
                                </span>
                            ) : (
                                <span className="font-mono text-sm uppercase tracking-widest relative z-10 flex items-center gap-2">
                                    Transmit Event Payload
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </span>
                            )}
                        </Button>
                    </div>
                </form>

                {log && (
                    <div className={`mt-8 p-5 rounded-xl border flex items-start relative z-10 transition-all backdrop-blur-md shadow-inner ${status === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-success/10 text-success border-success/30'}`}>
                        {status === 'error' ? (
                            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <span className="relative flex h-5 w-5 mr-3 mt-0.5 flex-shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-40"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-success/20 border border-success/50 items-center justify-center">
                                    <svg className="w-3 h-3 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </span>
                            </span>
                        )}
                        <span className="font-mono text-sm tracking-wide leading-relaxed">{log}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
