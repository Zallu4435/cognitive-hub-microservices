"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import SignOutButton from '../SignOutButton';

interface NavbarProps {
    isLoggedIn: boolean;
}

export default function Navbar({ isLoggedIn }: NavbarProps) {
    const pathname = usePathname();

    const navItems = [
        { name: 'Workspace', href: '/dashboard' },
        { name: 'Intelligence Feed', href: '/insights' },
        { name: 'Chat AI', href: '/chat' },
    ];

    return (
        <nav className="fixed w-full border-b border-white/5 bg-surface/30 backdrop-blur-xl z-50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative z-10">

                {/* Logo & Brand */}
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md group-hover:blur-xl transition-all duration-500" />
                        <span className="font-mono font-bold text-lg relative z-10">K</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-lg tracking-tight text-white leading-tight">
                            Knowledge Hub
                        </span>
                        <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                            OS // Core System
                        </span>
                    </div>
                </Link>

                {/* Navigation Links */}
                <div className="flex space-x-1 items-center">
                    {navItems.map((item) => {
                        const isActive = pathname?.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-widest transition-all duration-300 uppercase relative group ${
                                    isActive
                                        ? 'text-primary hover:text-primary-hover hover:bg-primary/10'
                                        : 'text-textMuted hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {item.name}
                                {isActive && (
                                    <span className="absolute bottom-1 left-4 right-4 h-px bg-primary/50 opacity-100 transition-opacity duration-300" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="h-5 w-px bg-white/10 mx-3"></div>
                    
                    {isLoggedIn ? (
                        <SignOutButton />
                    ) : (
                        <div className="flex space-x-2 items-center">
                            <Link
                                href="/login"
                                className="px-4 py-2 text-xs font-mono tracking-widest text-textMuted hover:text-white transition-all uppercase"
                            >
                                Authenticate
                            </Link>
                            <Link
                                href="/register"
                                className="px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 hover:border-primary/40 text-xs font-mono tracking-widest uppercase transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] relative overflow-hidden group"
                            >
                                <span className="relative z-10">Initialize</span>
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </nav>
    );
}
