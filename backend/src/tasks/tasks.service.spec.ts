import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from './entities/task.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { User, UserRole } from '../users/entities/user.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;
  let taskRepository: jest.Mocked<Repository<Task>>;
  let projectRepository: jest.Mocked<Repository<Project>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    status: ProjectStatus.ACTIVE,
    ownerId: 'user-1',
    owner: {} as User,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser: User = {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: UserRole.MEMBER,
    createdAt: new Date(),
    projects: [],
    assignedTasks: [],
  };

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    projectId: 'project-1',
    project: mockProject,
    assigneeId: 'user-1',
    assignee: mockUser,
    scheduledStart: new Date('2024-01-15T09:00:00.000Z'),
    scheduledEnd: new Date('2024-01-15T17:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    taskRepository = module.get(getRepositoryToken(Task));
    projectRepository = module.get(getRepositoryToken(Project));
    userRepository = module.get(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTaskDto = {
      title: 'New Task',
      description: 'New Description',
      priority: TaskPriority.HIGH,
      assigneeId: 'user-1',
      scheduledStart: '2024-01-15T09:00:00.000Z',
      scheduledEnd: '2024-01-15T17:00:00.000Z',
    };

    it('should create a task with valid data', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      userRepository.findOne.mockResolvedValue(mockUser);
      taskRepository.create.mockReturnValue(mockTask);
      taskRepository.save.mockResolvedValue(mockTask);

      const result = await service.create('project-1', createTaskDto);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(taskRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        projectId: 'project-1',
        status: TaskStatus.TODO,
        scheduledStart: new Date(createTaskDto.scheduledStart),
        scheduledEnd: new Date(createTaskDto.scheduledEnd),
      });
      expect(taskRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(service.create('project-1', createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('project-1', createTaskDto)).rejects.toThrow(
        "Project with ID 'project-1' not found",
      );
    });

    it('should throw NotFoundException if assignee does not exist', async () => {
      projectRepository.findOne.mockResolvedValue(mockProject);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.create('project-1', createTaskDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create('project-1', createTaskDto)).rejects.toThrow(
        "User with ID 'user-1' not found",
      );
    });
  });

  describe('findByProject', () => {
    it('should return tasks for a project with no filters', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      projectRepository.findOne.mockResolvedValue(mockProject);
      taskRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      const result = await service.findByProject('project-1', {});

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-1' },
      });
      expect(result).toEqual([mockTask]);
    });

    it('should filter tasks by status', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      projectRepository.findOne.mockResolvedValue(mockProject);
      taskRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findByProject('project-1', {
        status: TaskStatus.TODO,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'task.status = :status',
        { status: TaskStatus.TODO },
      );
    });

    it('should filter tasks by priority', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      projectRepository.findOne.mockResolvedValue(mockProject);
      taskRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findByProject('project-1', {
        priority: TaskPriority.HIGH,
      });

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'task.priority = :priority',
        { priority: TaskPriority.HIGH },
      );
    });

    it('should sort tasks by scheduledStart', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask]),
      };

      projectRepository.findOne.mockResolvedValue(mockProject);
      taskRepository.createQueryBuilder.mockReturnValue(
        queryBuilder as any,
      );

      await service.findByProject('project-1', {
        sortBy: 'scheduledStart',
        sortOrder: 'ASC',
      });

      expect(queryBuilder.orderBy).toHaveBeenCalledWith(
        'task.scheduledStart',
        'ASC',
      );
    });

    it('should throw NotFoundException if project does not exist', async () => {
      projectRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findByProject('project-1', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOne', () => {
    it('should return a task by id', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne('task-1');

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        relations: ['assignee', 'project'],
      });
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('task-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('task-1')).rejects.toThrow(
        "Task with ID 'task-1' not found",
      );
    });
  });

  describe('update', () => {
    it('should update a task with valid data', async () => {
      const updateDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };

      taskRepository.findOne.mockResolvedValue(mockTask);
      taskRepository.save.mockResolvedValue({
        ...mockTask,
        ...updateDto,
      });

      const result = await service.update('task-1', updateDto);

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-1' },
        relations: ['assignee', 'project'],
      });
      expect(taskRepository.save).toHaveBeenCalled();
      expect(result.title).toBe('Updated Task');
      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it('should validate new assignee exists when updating assigneeId', async () => {
      const updateDto = {
        assigneeId: 'user-2',
      };

      taskRepository.findOne.mockResolvedValue(mockTask);
      userRepository.findOne.mockResolvedValue(mockUser);
      taskRepository.save.mockResolvedValue({
        ...mockTask,
        assigneeId: 'user-2',
      });

      await service.update('task-1', updateDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-2' },
      });
    });

    it('should throw NotFoundException if new assignee does not exist', async () => {
      const updateDto = {
        assigneeId: 'user-2',
      };

      const taskWithDifferentAssignee = {
        ...mockTask,
        assigneeId: 'user-1', // Different from user-2
      };

      taskRepository.findOne.mockResolvedValue(taskWithDifferentAssignee);
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.update('task-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('task-1', updateDto)).rejects.toThrow(
        "User with ID 'user-2' not found",
      );
    });

    it('should throw BadRequestException if scheduledEnd is before scheduledStart', async () => {
      const updateDto = {
        scheduledStart: '2024-01-15T17:00:00.000Z',
        scheduledEnd: '2024-01-15T09:00:00.000Z',
      };

      taskRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.update('task-1', updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update('task-1', updateDto)).rejects.toThrow(
        'scheduledEnd must be after scheduledStart',
      );
    });

    it('should throw NotFoundException if task does not exist', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.update('task-1', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      taskRepository.remove.mockResolvedValue(mockTask);

      await service.delete('task-1');

      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
      expect(taskRepository.remove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      taskRepository.findOne.mockResolvedValue(null);

      await expect(service.delete('task-1')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.delete('task-1')).rejects.toThrow(
        "Task with ID 'task-1' not found",
      );
    });
  });
});
