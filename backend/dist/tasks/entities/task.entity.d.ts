import { Project } from '../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
export declare enum TaskPriority {
    LOW = "LOW",
    MEDIUM = "MEDIUM",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum TaskStatus {
    TODO = "TODO",
    IN_PROGRESS = "IN_PROGRESS",
    DONE = "DONE"
}
export declare class Task {
    id: string;
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    projectId: string;
    project: Project;
    assigneeId: string;
    assignee: User;
    scheduledStart: Date;
    scheduledEnd: Date;
    createdAt: Date;
    updatedAt: Date;
}
