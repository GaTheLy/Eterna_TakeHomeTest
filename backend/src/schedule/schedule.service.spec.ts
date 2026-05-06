import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, TaskPriority } from '../tasks/entities/task.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { User, UserRole } from '../users/entities/user.entity';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let taskRepository: jest.Mocked<Repository<Task>>;

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

  const mockProject: Project = {
    id: 'project-1',
    name: 'Test Project',
    description: 'Test Description',
    status: ProjectStatus.ACTIVE,
    ownerId: 'user-1',
    owner: mockUser,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask1: Task = {
    id: 'task-1',
    title: 'Task 1',
    description: 'Description 1',
    priority: TaskPriority.HIGH,
    status: TaskStatus.TODO,
    projectId: 'project-1',
    project: mockProject,
    assigneeId: 'user-1',
    assignee: mockUser,
    scheduledStart: new Date('2024-01-15T09:00:00.000Z'),
    scheduledEnd: new Date('2024-01-15T12:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask2: Task = {
    id: 'task-2',
    title: 'Task 2',
    description: 'Description 2',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    projectId: 'project-1',
    project: mockProject,
    assigneeId: 'user-1',
    assignee: mockUser,
    scheduledStart: new Date('2024-01-15T11:00:00.000Z'),
    scheduledEnd: new Date('2024-01-15T14:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        {
          provide: getRepositoryToken(Task),
          useValue: {
            find: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
    taskRepository = module.get(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSchedule', () => {
    it('should return tasks within date range', async () => {
      const query = {
        start: '2024-01-15T00:00:00.000Z',
        end: '2024-01-15T23:59:59.999Z',
      };

      taskRepository.find.mockResolvedValue([mockTask1, mockTask2]);

      const result = await service.getSchedule(query);

      expect(taskRepository.find).toHaveBeenCalledWith({
        where: {
          scheduledStart: expect.anything(),
          scheduledEnd: expect.anything(),
        },
        relations: ['project', 'assignee'],
        order: {
          scheduledStart: 'ASC',
        },
      });
      expect(result).toEqual([mockTask1, mockTask2]);
    });

    it('should return empty array when no tasks in range', async () => {
      const query = {
        start: '2024-02-01T00:00:00.000Z',
        end: '2024-02-28T23:59:59.999Z',
      };

      taskRepository.find.mockResolvedValue([]);

      const result = await service.getSchedule(query);

      expect(result).toEqual([]);
    });
  });

  describe('detectConflicts', () => {
    it('should detect overlapping tasks for same assignee', async () => {
      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask1, mockTask2]),
      };

      taskRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.detectConflicts();

      expect(result).toHaveLength(1);
      expect(result[0].assignee.id).toBe('user-1');
      expect(result[0].conflictingTasks).toHaveLength(2);
    });

    it('should return empty array when no conflicts', async () => {
      const nonOverlappingTask: Task = {
        ...mockTask2,
        scheduledStart: new Date('2024-01-15T13:00:00.000Z'),
        scheduledEnd: new Date('2024-01-15T15:00:00.000Z'),
      };

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask1, nonOverlappingTask]),
      };

      taskRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.detectConflicts();

      expect(result).toEqual([]);
    });

    it('should ignore tasks for different assignees', async () => {
      const differentUser: User = {
        ...mockUser,
        id: 'user-2',
        email: 'user2@example.com',
      };

      const taskForDifferentUser: Task = {
        ...mockTask2,
        assigneeId: 'user-2',
        assignee: differentUser,
      };

      const queryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockTask1, taskForDifferentUser]),
      };

      taskRepository.createQueryBuilder.mockReturnValue(queryBuilder as any);

      const result = await service.detectConflicts();

      expect(result).toEqual([]);
    });
  });
});
