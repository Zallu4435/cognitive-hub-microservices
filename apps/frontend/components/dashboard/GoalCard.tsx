import Button from "../ui/Button";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";

import { Goal } from "../../types/goal";

interface GoalCardProps {
    goal: Goal;
    onCompleteTask: (taskId: string, goalId: string) => void;
}

export default function GoalCard({ goal, onCompleteTask }: GoalCardProps) {
    const isGoalCompleted = goal.tasks.every(t => t.status === "DONE") && goal.tasks.length > 0;

    return (
        <div key={goal.id} className={`relative bg-surface/30 backdrop-blur-xl border ${isGoalCompleted ? 'border-success/40' : 'border-white/5'} rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col transition-all duration-500 hover:border-primary/30 group overflow-hidden`}>
            
            <div className={`absolute inset-0 bg-gradient-to-br ${isGoalCompleted ? 'from-success/10' : 'from-primary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            
            {isGoalCompleted && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-success/20 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            )}

            <div className="relative z-10 flex justify-between items-start border-b border-white/10 pb-5 mb-6">
                <div>
                    <h3 className={`text-xl font-bold tracking-tight mb-1 ${isGoalCompleted ? 'text-success drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'text-white group-hover:text-primary transition-colors'}`}>
                        {goal.title}
                    </h3>
                    <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">OBJ_ID: {goal.id.split('-')[0]}</p>
                </div>
                {isGoalCompleted && (
                    <span className="bg-success/20 border border-success/40 text-success text-[10px] uppercase font-mono font-bold px-2.5 py-1 rounded-md tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.2)] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                        100% Secure
                    </span>
                )}
            </div>

            <div className="space-y-3 flex-1 relative z-10">
                {goal.tasks.length === 0 ? (
                    <div className="text-center py-8 text-xs font-mono text-zinc-500 uppercase tracking-widest border border-dashed border-white/10 rounded-xl bg-surface/20">Awaiting tasks...</div>
                ) : goal.tasks.map((task) => (
                    <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${task.status === "DONE"
                            ? "bg-surface/10 border-success/20 opacity-50"
                            : "bg-surface/50 border-white/5 hover:border-white/20 hover:bg-surface/80 shadow-inner group/task"
                            }`}
                    >
                        <div className="flex items-center space-x-4 overflow-hidden pr-2">
                            {task.status === "DONE" ? (
                                <CheckCircleIcon className="w-5 h-5 text-success flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            ) : (
                                <div className="w-5 h-5 rounded-full border border-zinc-600 group-hover/task:border-primary/50 transition-colors flex-shrink-0 relative">
                                    <div className="absolute inset-1 rounded-full bg-primary/20 opacity-0 group-hover/task:opacity-100 transition-opacity" />
                                </div>
                            )}
                            <span className={`text-sm font-medium truncate ${task.status === "DONE" ? "text-zinc-500 line-through decoration-zinc-600" : "text-zinc-300 group-hover/task:text-white transition-colors"}`}>
                                {task.title}
                            </span>
                        </div>

                        {task.status !== "DONE" ? (
                            <Button
                                onClick={() => onCompleteTask(task.id, goal.id)}
                                variant="success"
                                size="sm"
                                className="flex-shrink-0 !py-1.5 !px-3 shadow-[0_0_10px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] border-success/30 hover:border-success/60 bg-success/10 hover:bg-success/20 text-success rounded-lg opacity-0 group-hover/task:opacity-100 transition-all duration-300 translate-x-2 group-hover/task:translate-x-0"
                            >
                                <span className="font-mono text-[10px] uppercase tracking-wider font-bold">Done</span>
                            </Button>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
}
