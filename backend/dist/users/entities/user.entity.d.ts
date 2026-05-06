import { Project } from '../../projects/entities/project.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare enum UserRole {
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    createdAt: Date;
    projects: Project[];
    assignedTasks: Task[];
}
