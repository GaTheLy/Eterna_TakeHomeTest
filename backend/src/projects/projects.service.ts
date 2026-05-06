import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { TaskStatus } from '../tasks/entities/task.entity';

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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Create a new project
   * Sets owner to current user and default status to ACTIVE
   */
  async create(
    dto: CreateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = this.projectRepository.create({
      ...dto,
      ownerId: userId,
      status: ProjectStatus.ACTIVE,
    });

    return await this.projectRepository.save(project);
  }

  /**
   * Find all projects with pagination and search filtering
   */
  async findAll(
    query: ProjectQueryDto,
  ): Promise<PaginatedResponse<Project>> {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    // Add search filter if provided
    if (search) {
      whereCondition.name = ILike(`%${search}%`);
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where: whereCondition,
      relations: ['owner'],
      skip,
      take: limit,
      order: {
        createdAt: 'DESC',
      },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find one project with task count grouped by status
   */
  async findOne(id: string): Promise<ProjectDetailResponse> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${id}' not found`);
    }

    // Calculate task summary grouped by status
    const taskSummary = {
      TODO: 0,
      IN_PROGRESS: 0,
      DONE: 0,
    };

    if (project.tasks) {
      project.tasks.forEach((task) => {
        if (task.status === TaskStatus.TODO) {
          taskSummary.TODO++;
        } else if (task.status === TaskStatus.IN_PROGRESS) {
          taskSummary.IN_PROGRESS++;
        } else if (task.status === TaskStatus.DONE) {
          taskSummary.DONE++;
        }
      });
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      owner: {
        id: project.owner.id,
        name: project.owner.name,
        email: project.owner.email,
      },
      taskSummary,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }

  /**
   * Update project
   * Validates ownership before updating
   */
  async update(
    id: string,
    dto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['owner'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${id}' not found`);
    }

    // Validate ownership
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this project',
      );
    }

    // Update fields
    Object.assign(project, dto);

    return await this.projectRepository.save(project);
  }

  /**
   * Archive project (soft delete)
   * Sets status to ARCHIVED
   */
  async archive(id: string, userId: string): Promise<void> {
    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${id}' not found`);
    }

    // Validate ownership
    if (project.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to archive this project',
      );
    }

    project.status = ProjectStatus.ARCHIVED;
    await this.projectRepository.save(project);
  }
}
