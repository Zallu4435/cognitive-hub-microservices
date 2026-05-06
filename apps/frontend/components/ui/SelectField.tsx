import { SelectHTMLAttributes } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectOption[];
    error?: string;
}

export default function SelectField({ label, options, error, className = '', ...rest }: SelectFieldProps) {
    return (
        <div className="w-full flex flex-col group">
            {label && (
                <label className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-2 group-focus-within:text-primary transition-colors font-mono">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    className={`w-full bg-surface/40 backdrop-blur-md border rounded-xl px-4 py-3.5 text-textMain focus:outline-none focus:ring-2 transition-all duration-300 ease-out shadow-inner appearance-none cursor-pointer ${error
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20 bg-red-500/5'
                            : 'border-white/10 hover:border-white/20 focus:border-primary/60 focus:ring-primary/20 focus:bg-surface/60'
                        } ${className}`}
                    {...rest}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-surface text-textMain py-2">
                            {opt.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-textMuted group-focus-within:text-primary transition-colors">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </div>
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
