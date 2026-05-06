import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    ...rest
}: ButtonProps) {
    const baseStyles = "relative overflow-hidden font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex justify-center items-center active:scale-[0.98]";

    const variants = {
        primary: "bg-primary hover:bg-primary-hover text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border border-primary/50 hover:border-primary/80",
        secondary: "bg-surface/50 backdrop-blur-md hover:bg-surface border border-white/10 hover:border-white/20 text-zinc-200",
        danger: "bg-red-500/10 backdrop-blur-md hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400",
        success: "bg-success/10 backdrop-blur-md hover:bg-success/20 border border-success/20 hover:border-success/40 text-success"
    };

    const sizes = {
        sm: "py-1.5 px-4 text-xs tracking-wide",
        md: "py-2.5 px-6 text-sm tracking-wide",
        lg: "py-3 px-8 text-base tracking-wide"
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className} group`}
            {...rest}
        >
            <span className="relative z-10 flex items-center justify-center gap-2">
                {children}
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </button>
    );
}
