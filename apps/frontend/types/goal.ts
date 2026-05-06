export interface Task {
    id: string;
    title: string;
    status: 'TODO' | 'DONE';
}

export interface Goal {
    id: string;
    title: string;
    userId: string;
    createdAt: string;
    tasks: Task[];
}
