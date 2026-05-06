export interface Insight {
    _id: string;
    eventId: string;
    userId: string;
    type: 'career_roadmap' | 'productivity_insight';
    ai_summary: string;
    processed_at: string;
    goal?: string;
    task?: string;
    role?: string;
}
