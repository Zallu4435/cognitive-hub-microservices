import { useState } from "react";
import InputField from "../ui/InputField";
import Button from "../ui/Button";

interface CreateGoalWidgetProps {
    onGoalCreated: (newGoalTitle: string, taskArray: string[]) => Promise<void>;
}

export default function CreateGoalWidget({ onGoalCreated }: CreateGoalWidgetProps) {
    const [newGoalTitle, setNewGoalTitle] = useState("");
    const [newTasks, setNewTasks] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        const taskArray = newTasks.split(",").map(t => t.trim()).filter(t => t.length > 0);
        try {
            await onGoalCreated(newGoalTitle, taskArray);
            setNewGoalTitle("");
            setNewTasks("");
        } catch (error) {
            console.error(error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="bg-surface/30 backdrop-blur-2xl p-8 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden group animate-slide-up">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none transition-all duration-700 group-hover:bg-primary/20"></div>

            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/30 rounded-tl-2xl pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/30 rounded-br-2xl pointer-events-none" />

            <div className="flex items-center mb-8 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10 flex items-center justify-center mr-5 shadow-inner group-hover:scale-105 transition-transform duration-500">
                    <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">Initialize Objective Sequence</h2>
                    <p className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-wider">Configure new milestone parameters</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6 items-end relative z-10">
                <div className="flex-1 w-full">
                    <InputField
                        type="text" required placeholder="e.g. Master Next.js 14"
                        value={newGoalTitle} onChange={(e) => setNewGoalTitle(e.target.value)}
                        label="Objective Title"
                    />
                </div>
                <div className="flex-1 w-full">
                    <InputField
                        type="text" required placeholder="e.g. Read docs, Build clone, Deploy"
                        value={newTasks} onChange={(e) => setNewTasks(e.target.value)}
                        label="Execution Tasks (Comma-Separated)"
                    />
                </div>
                <div className="w-full lg:w-auto">
                    <Button
                        type="submit"
                        disabled={isCreating}
                        variant="primary"
                        size="lg"
                        className="w-full lg:w-auto h-[54px] shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] border-primary/50 hover:border-primary/80 whitespace-nowrap px-10"
                    >
                        {isCreating ? (
                            <span className="flex items-center font-mono uppercase tracking-widest text-sm">
                                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Deploying...
                            </span>
                        ) : (
                            <span className="font-mono uppercase tracking-widest text-sm flex items-center gap-2">
                                Execute
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
