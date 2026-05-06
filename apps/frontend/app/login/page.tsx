"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { apiClient } from "../../lib/api-client";
import { loginSchema } from "../../lib/validations/auth";
import { z } from "zod";

type ValidationErrors = Partial<Record<keyof z.infer<typeof loginSchema>, string>>;

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
    const [globalError, setGlobalError] = useState("");
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateForm = () => {
        try {
            loginSchema.parse({ email, password });
            setErrors({});
            return true;
        } catch (error: any) {
            if (error instanceof z.ZodError || error?.errors) {
                const newErrors: ValidationErrors = {};
                error.errors.forEach((err: any) => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as keyof ValidationErrors] = err.message;
                    }
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setStatus("loading");
        setGlobalError("");

        try {
            const res = await apiClient.post('/auth/login', { email, password });
            const data = res.data;

            // Only store user info on the client side, NOT the JWT!
            localStorage.setItem("kh_os_user", JSON.stringify(data.user || data));

            // Proxy automatically injected HttpOnly session cookie into the browser securely

            // Redirect to the dashboard! Force full reload to update Server Component layout (Navbar)
            window.location.href = "/dashboard";
        } catch (err: any) {
            setStatus("error");

            // 401 = wrong credentials — show a direct, clean message without refreshing
            if (err.status === 401 || err.response?.status === 401) {
                setGlobalError("Incorrect email or password. Please try again.");
                return;
            }

            // Handle structured backend validation errors (e.g. class-validator arrays)
            const rawMsg = err.response?.data?.message;
            if (rawMsg && Array.isArray(rawMsg)) {
                const backendErrors: ValidationErrors = {};
                rawMsg.forEach((msg: string) => {
                    if (msg.toLowerCase().includes("email")) backendErrors.email = msg;
                    else if (msg.toLowerCase().includes("password")) backendErrors.password = msg;
                    else setGlobalError(msg);
                });
                setErrors(prev => ({ ...prev, ...backendErrors }));
            } else {
                setGlobalError(err.message || "An unexpected error occurred. Please try again.");
            }
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[85vh] px-4 py-8 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-[100px] pointer-events-none animate-blob" />
            
            <div className="relative w-full max-w-[440px] animate-fade-in">
                {/* Decorative Tech Accents */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-xl pointer-events-none" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-xl pointer-events-none" />
                
                <div className="bg-surface/30 backdrop-blur-2xl p-8 sm:p-10 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                    
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 text-primary mb-6 shadow-inner relative group">
                            <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md group-hover:blur-xl transition-all duration-500" />
                            <svg className="w-7 h-7 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 tracking-tight mb-3">
                            Welcome Back
                        </h1>
                        <p className="text-textMuted text-sm font-mono tracking-wide uppercase">
                            SYSTEM // AUTHENTICATION
                        </p>
                    </div>

                    {globalError && (
                        <div className="mb-8 p-4 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20 flex items-start animate-slide-up backdrop-blur-md">
                            <svg className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{globalError}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6" noValidate>
                        <InputField
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                            }}
                            placeholder="OPERATOR ID"
                            error={errors.email}
                            disabled={status === "loading"}
                        />

                        <InputField
                            label="Security Key"
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                            }}
                            placeholder="••••••••"
                            error={errors.password}
                            disabled={status === "loading"}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={status === "loading"}
                                variant="primary"
                                size="lg"
                                fullWidth
                            >
                                {status === "loading" ? (
                                    <span className="flex items-center justify-center font-mono uppercase tracking-widest text-sm">
                                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Authenticating...
                                    </span>
                                ) : (
                                    <span className="font-mono uppercase tracking-widest text-sm">Initialize Session</span>
                                )}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-8 pt-6 border-t border-white/5 text-center text-sm font-mono tracking-wide">
                        <span className="text-zinc-500 mr-2">STATUS: UNREGISTERED?</span>
                        <Link href="/register" className="text-primary hover:text-primary-hover hover:underline underline-offset-4 transition-all">
                            CREATE PROFILE
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
