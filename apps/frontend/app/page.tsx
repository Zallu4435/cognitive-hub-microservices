import Link from 'next/link';

export default function Home() {
    return (
        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-12 overflow-visible">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow -translate-x-1/4 -translate-y-1/4" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-blob translate-x-1/4 translate-y-1/4" />

            <div className="relative text-center max-w-5xl w-full z-10 animate-fade-in">
                {/* Badge */}
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-10 rounded-full bg-surface/50 border border-success/30 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)] group hover:border-success/60 transition-colors duration-300">
                    <span className="w-2 h-2 rounded-full bg-success mr-3 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                    <span className="text-success text-xs font-mono font-semibold uppercase tracking-widest">
                        SYS.CORE :: ONLINE
                    </span>
                </div>

                {/* Main Heading */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 leading-[1.1]">
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 mb-2">
                        Initialize Your
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-pulse-slow drop-shadow-[0_0_30px_rgba(99,102,241,0.4)] pb-4">
                        Knowledge Engine
                    </span>
                </h1>

                {/* Subtext */}
                <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                    The next-generation, AI-driven productivity brain. Manage your goals, connect your thoughts, and receive intelligent insights instantly—all powered by a blazing-fast microservice architecture.
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
                    <Link
                        href="/register"
                        className="group relative w-full sm:w-auto px-8 py-4 bg-primary/10 border border-primary/40 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:border-primary/80 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-primary/20 blur-md group-hover:blur-xl transition-all duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative z-10 font-mono text-sm uppercase tracking-widest font-bold text-white flex items-center justify-center gap-2">
                            Deploy Workspace
                            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </Link>

                    <Link
                        href="/login"
                        className="group w-full sm:w-auto px-8 py-4 bg-surface/40 backdrop-blur-md border border-white/10 rounded-xl hover:bg-surface/80 hover:border-white/20 transition-all duration-300 shadow-inner"
                    >
                        <span className="font-mono text-sm uppercase tracking-widest text-zinc-300 group-hover:text-white transition-colors">
                            Authenticate
                        </span>
                    </Link>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
                    <div className="absolute -inset-4 bg-gradient-to-b from-transparent via-primary/5 to-transparent blur-2xl -z-10" />
                    
                    <div className="bg-surface/30 backdrop-blur-xl p-8 rounded-2xl border border-white/5 hover:border-primary/40 transition-all duration-500 group relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(99,102,241,0.15)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                            <span className="text-xl relative z-10">🧠</span>
                            <div className="absolute inset-0 bg-primary/20 blur-md group-hover:blur-xl transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">AI-Powered Insights</h3>
                        <p className="text-textMuted text-sm leading-relaxed">Let our Gemini engine analyze your goals and tasks in real-time, providing proactive coaching and intelligence.</p>
                        
                        {/* Decorative HUD Corner */}
                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-primary/40 uppercase">MOD_01</div>
                    </div>

                    <div className="bg-surface/30 backdrop-blur-xl p-8 rounded-2xl border border-white/5 hover:border-accent/40 transition-all duration-500 group relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(139,92,246,0.15)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                            <span className="text-xl relative z-10">⚡</span>
                            <div className="absolute inset-0 bg-accent/20 blur-md group-hover:blur-xl transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">Event-Driven Flow</h3>
                        <p className="text-textMuted text-sm leading-relaxed">A lightning-fast, decoupled microservice backend built for extreme scale with high-availability message brokers.</p>
                        
                        {/* Decorative HUD Corner */}
                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-accent/40 uppercase">MOD_02</div>
                    </div>

                    <div className="bg-surface/30 backdrop-blur-xl p-8 rounded-2xl border border-white/5 hover:border-success/40 transition-all duration-500 group relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(16,185,129,0.15)]">
                        <div className="absolute inset-0 bg-gradient-to-br from-success/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success/20 to-emerald-500/20 border border-white/10 flex items-center justify-center mb-6 relative group-hover:scale-110 transition-transform duration-500">
                            <span className="text-xl relative z-10">🛡️</span>
                            <div className="absolute inset-0 bg-success/20 blur-md group-hover:blur-xl transition-all" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-3">Secure by Default</h3>
                        <p className="text-textMuted text-sm leading-relaxed">Enterprise-grade JWT authentication and secure Next.js HTTP-only proxy routing protect your data at every single layer.</p>
                        
                        {/* Decorative HUD Corner */}
                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-success/40 uppercase">MOD_03</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
