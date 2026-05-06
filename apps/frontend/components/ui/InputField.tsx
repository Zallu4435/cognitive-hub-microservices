interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export default function InputField({ label, error, className = '', ...rest }: InputFieldProps) {
    return (
        <div className="w-full flex flex-col group">
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-2 group-focus-within:text-primary transition-colors font-mono">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    className={`w-full bg-surface/40 backdrop-blur-md border rounded-xl px-4 py-3.5 text-textMain placeholder:text-zinc-600 focus:outline-none focus:ring-2 transition-all duration-300 ease-out shadow-inner ${error
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5'
                            : 'border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-primary/20 focus:bg-surface/60'
                        } ${className}`}
                    {...rest}
                />
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-400/90 font-medium animate-slide-up flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
