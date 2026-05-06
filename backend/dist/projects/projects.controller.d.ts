import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { User } from '../users/entities/user.entity';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    findAll(query: ProjectQueryDto): Promise<import("./projects.service").PaginatedResponse<import("./entities/project.entity").Project>>;
    create(createProjectDto: CreateProjectDto, user: User): Promise<import("./entities/project.entity").Project>;
    findOne(id: string): Promise<import("./projects.service").ProjectDetailResponse>;
    update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<import("./entities/project.entity").Project>;
    archive(id: string, user: User): Promise<void>;
}
