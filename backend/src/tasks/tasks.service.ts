import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { Project } from '../projects/entities/project.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  /**
   * Create a new task in a project
   * Validates that project and assignee exist
   * Defaults status to TODO
   * Sends notification to assignee
   */
  async create(projectId: string, dto: CreateTaskDto): Promise<Task> {
    // Validate project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${projectId}' not found`);
    }

    // Validate assignee exists
    const assignee = await this.userRepository.findOne({
      where: { id: dto.assigneeId },
    });

    if (!assignee) {
      throw new NotFoundException(
        `User with ID '${dto.assigneeId}' not found`,
      );
    }

    // Create task with default status TODO
    const task = this.taskRepository.create({
      ...dto,
      projectId,
      status: TaskStatus.TODO,
      scheduledStart: new Date(dto.scheduledStart),
      scheduledEnd: new Date(dto.scheduledEnd),
    });

    const savedTask = await this.taskRepository.save(task);

    // Send notification to assignee
    this.notificationsGateway.sendNotification(
      dto.assigneeId,
      'task_assigned',
      {
        taskId: savedTask.id,
        title: savedTask.title,
        projectName: project.name,
        message: `You have been assigned to task: ${savedTask.title}`,
      },
    );

    return savedTask;
  }

  /**
   * Find tasks by project with filtering and sorting
   */
  async findByProject(
    projectId: string,
    query: TaskQueryDto,
  ): Promise<Task[]> {
    // Validate project exists
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID '${projectId}' not found`);
    }

    const queryBuilder = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.projectId = :projectId', { projectId });

    // Apply filters
    if (query.status) {
      queryBuilder.andWhere('task.status = :status', { status: query.status });
    }

    if (query.priority) {
      queryBuilder.andWhere('task.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.assigneeId) {
      queryBuilder.andWhere('task.assigneeId = :assigneeId', {
        assigneeId: query.assigneeId,
      });
    }

    // Apply sorting
    const sortBy = query.sortBy || 'scheduledStart';
    const sortOrder = query.sortOrder || 'ASC';

    if (sortBy === 'scheduledStart') {
      queryBuilder.orderBy('task.scheduledStart', sortOrder);
    } else if (sortBy === 'priority') {
      // Sort by priority: URGENT > HIGH > MEDIUM > LOW
      const priorityOrder = `CASE task.priority 
        WHEN 'URGENT' THEN 1 
        WHEN 'HIGH' THEN 2 
        WHEN 'MEDIUM' THEN 3 
        WHEN 'LOW' THEN 4 
        END`;
      queryBuilder.orderBy(priorityOrder, sortOrder);
    }

    return await queryBuilder.getMany();
  }

  /**
   * Find one task with full details
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    return task;
  }

  /**
   * Update task
   * Validates date constraints and updates fields and timestamp
   * Sends notification if assignee changes
   */
  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['assignee', 'project'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    const oldAssigneeId = task.assigneeId;

    // If assigneeId is being updated, validate the new assignee exists
    if (dto.assigneeId && dto.assigneeId !== task.assigneeId) {
      const assignee = await this.userRepository.findOne({
        where: { id: dto.assigneeId },
      });

      if (!assignee) {
        throw new NotFoundException(
          `User with ID '${dto.assigneeId}' not found`,
        );
      }
    }

    // Validate date constraints if dates are being updated
    if (dto.scheduledStart || dto.scheduledEnd) {
      const newStart = dto.scheduledStart
        ? new Date(dto.scheduledStart)
        : task.scheduledStart;
      const newEnd = dto.scheduledEnd
        ? new Date(dto.scheduledEnd)
        : task.scheduledEnd;

      if (newEnd <= newStart) {
        throw new BadRequestException(
          'scheduledEnd must be after scheduledStart',
        );
      }

      // Update date fields
      if (dto.scheduledStart) {
        task.scheduledStart = newStart;
      }
      if (dto.scheduledEnd) {
        task.scheduledEnd = newEnd;
      }
    }

    // Update other fields
    if (dto.title !== undefined) {
      task.title = dto.title;
    }
    if (dto.description !== undefined) {
      task.description = dto.description;
    }
    if (dto.priority !== undefined) {
      task.priority = dto.priority;
    }
    if (dto.status !== undefined) {
      task.status = dto.status;
    }
    if (dto.assigneeId !== undefined) {
      task.assigneeId = dto.assigneeId;
    }

    // updatedAt is automatically updated by TypeORM
    const savedTask = await this.taskRepository.save(task);

    // Send notification if assignee changed
    if (dto.assigneeId && dto.assigneeId !== oldAssigneeId) {
      this.notificationsGateway.sendNotification(
        dto.assigneeId,
        'task_assigned',
        {
          taskId: savedTask.id,
          title: savedTask.title,
          projectName: savedTask.project.name,
          message: `You have been assigned to task: ${savedTask.title}`,
        },
      );
    }

    return savedTask;
  }

  /**
   * Delete task (hard delete from database)
   */
  async delete(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({
      where: { id },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID '${id}' not found`);
    }

    await this.taskRepository.remove(task);
  }
}
