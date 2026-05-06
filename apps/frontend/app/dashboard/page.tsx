"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import CreateGoalWidget from "../../components/dashboard/CreateGoalWidget";
import GoalCard from "../../components/dashboard/GoalCard";
import { AlertIcon } from "../../components/icons/AlertIcon";
import { apiClient } from "../../lib/api-client";

import { Goal } from "../../types/goal";

export default function DashboardPage() {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch Goals on Mount
    useEffect(() => {
        const fetchGoals = async () => {
            try {
                const res = await apiClient.get('/goals');
                // The backend returns { items: [], meta: {} }, so we need to access .items
                setGoals(Array.isArray(res.data.items) ? res.data.items : []);
            } catch (err: any) {
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchGoals();
    }, [router]);

    // Complete a Task
    const handleCompleteTask = async (taskId: string, goalId: string) => {
        // Save previous status for rollback on failure
        const previousGoals = goals;

        try {
            // Optimistic UI Update: Mark it done immediately on the screen
            setGoals((prev) =>
                prev.map((g) => {
                    if (g.id === goalId) {
                        return {
                            ...g,
                            tasks: g.tasks.map((t) => (t.id === taskId ? { ...t, status: "DONE" } : t)),
                        };
                    }
                    return g;
                })
            );

            // Fire the actual request transparently through the secure interceptor
            await apiClient.patch(`/goals/tasks/${taskId}/complete`);
        } catch (err: any) {
            // Rollback the optimistic update on failure
            setGoals(previousGoals);
            setError(err.message || "Failed to sync task completion. Please try again.");
        }
    };

    // Create a New Goal Handler Passed to Widget
    const handleGoalCreated = async (title: string, taskArray: string[]) => {
        try {
            const res = await apiClient.post("/goals", { title, tasks: taskArray });
            setGoals((prev) => [res.data, ...prev]);
        } catch (err: any) {
            setError(err.message || "Failed to create goal");
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="relative flex items-center justify-center w-20 h-20">
                <div className="absolute inset-0 border-t-2 border-l-2 border-primary rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-b-2 border-r-2 border-accent rounded-full animate-pulse"></div>
                <span className="font-mono text-xs text-primary font-bold">SYS</span>
            </div>
            <p className="mt-6 text-primary font-mono uppercase tracking-widest text-sm animate-pulse">Initializing Workspace...</p>
        </div>
    );

    return (
        <div className="w-full flex-1 flex flex-col pb-12 relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="mb-12 relative z-10 animate-fade-in">
                <div className="inline-flex items-center justify-center px-4 py-1.5 mb-4 rounded-full bg-surface/50 border border-primary/30 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                    <span className="w-2 h-2 rounded-full bg-primary mr-3 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-pulse"></span>
                    <span className="text-primary text-[10px] font-mono font-bold uppercase tracking-widest">
                        Module :: Workspace
                    </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                    Command Center
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl font-light">Deploy goals, execute tasks, and feed intelligence into your AI cognitive engine.</p>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-start backdrop-blur-md animate-slide-up">
                    <AlertIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="font-mono text-sm tracking-wide">{error}</span>
                </div>
            )}

            {/* --- CREATE NEW GOAL WIDGET --- */}
            <CreateGoalWidget onGoalCreated={handleGoalCreated} />

            {/* --- GOALS LIST --- */}
            <div className="mt-16 relative z-10">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        Active Deployments
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest hidden sm:inline-block">Total Active:</span>
                        <span className="px-3 py-1 rounded-lg bg-surface/50 border border-white/10 text-sm font-mono font-bold text-primary shadow-inner">
                            {goals.length}
                        </span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {goals.length === 0 ? (
                        <div className="col-span-full bg-surface/20 backdrop-blur-xl border border-white/5 border-dashed rounded-2xl flex flex-col items-center justify-center py-20 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 relative z-10">No active deployments</h3>
                            <p className="text-zinc-500 max-w-sm font-light relative z-10">Initialize your first objective sequence above to commence operations.</p>
                        </div>
                    ) : (
                        goals.map(goal => (
                            <GoalCard key={goal.id} goal={goal} onCompleteTask={handleCompleteTask} />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
