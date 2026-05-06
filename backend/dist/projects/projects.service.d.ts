import { Repository } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface ProjectDetailResponse {
    id: string;
    name: string;
    description: string;
    status: ProjectStatus;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    taskSummary: {
        TODO: number;
        IN_PROGRESS: number;
        DONE: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare class ProjectsService {
    private readonly projectRepository;
    constructor(projectRepository: Repository<Project>);
    create(dto: CreateProjectDto, userId: string): Promise<Project>;
    findAll(query: ProjectQueryDto): Promise<PaginatedResponse<Project>>;
    findOne(id: string): Promise<ProjectDetailResponse>;
    update(id: string, dto: UpdateProjectDto, userId: string): Promise<Project>;
    archive(id: string, userId: string): Promise<void>;
}
