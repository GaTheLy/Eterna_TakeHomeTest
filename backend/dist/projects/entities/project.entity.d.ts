import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare enum ProjectStatus {
    ACTIVE = "ACTIVE",
    ARCHIVED = "ARCHIVED"
}
export declare class Project {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    ownerId: string;
    owner: User;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
