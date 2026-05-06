import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import {
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { TaskStatus } from '../tasks/entities/task.entity';
import { UserRole } from '../users/entities/user.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repository: jest.Mocked<Repository<Project>>;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashed_password',
    role: UserRole.MEMBER,
    createdAt: new Date(),
    projects: [],
    assignedTasks: [],
  };

  const mockProject: Project = {
    id: 'project-123',
    name: 'Test Project',
    description: 'Test Description',
    status: ProjectStatus.ACTIVE,
    ownerId: 'user-123',
    owner: mockUser,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findAndCount: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repository = module.get(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project with ACTIVE status', async () => {
      const createDto: CreateProjectDto = {
        name: 'New Project',
        description: 'New Description',
      };

      const createdProject = {
        ...createDto,
        id: 'new-project-123',
        ownerId: mockUser.id,
        status: ProjectStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.create.mockReturnValue(createdProject as any);
      repository.save.mockResolvedValue(createdProject as any);

      const result = await service.create(createDto, mockUser.id);

      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        ownerId: mockUser.id,
        status: ProjectStatus.ACTIVE,
      });
      expect(repository.save).toHaveBeenCalledWith(createdProject);
      expect(result.status).toBe(ProjectStatus.ACTIVE);
      expect(result.ownerId).toBe(mockUser.id);
    });
  });

  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const query: ProjectQueryDto = {
        page: 1,
        limit: 10,
      };

      const projects = [mockProject];
      const total = 1;

      repository.findAndCount.mockResolvedValue([projects, total]);

      const result = await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['owner'],
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.data).toEqual(projects);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter projects by search term', async () => {
      const query: ProjectQueryDto = {
        page: 1,
        limit: 10,
        search: 'Test',
      };

      const projects = [mockProject];
      const total = 1;

      repository.findAndCount.mockResolvedValue([projects, total]);

      const result = await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { name: ILike('%Test%') },
        relations: ['owner'],
        skip: 0,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.data).toEqual(projects);
    });

    it('should calculate correct pagination for page 2', async () => {
      const query: ProjectQueryDto = {
        page: 2,
        limit: 10,
      };

      const projects = [mockProject];
      const total = 15;

      repository.findAndCount.mockResolvedValue([projects, total]);

      const result = await service.findAll(query);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: {},
        relations: ['owner'],
        skip: 10,
        take: 10,
        order: {
          createdAt: 'DESC',
        },
      });
      expect(result.meta.totalPages).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should return project with task summary', async () => {
      const projectWithTasks = {
        ...mockProject,
        tasks: [
          { id: '1', status: TaskStatus.TODO } as any,
          { id: '2', status: TaskStatus.TODO } as any,
          { id: '3', status: TaskStatus.IN_PROGRESS } as any,
          { id: '4', status: TaskStatus.DONE } as any,
        ],
      };

      repository.findOne.mockResolvedValue(projectWithTasks);

      const result = await service.findOne('project-123');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        relations: ['owner', 'tasks'],
      });
      expect(result.taskSummary).toEqual({
        TODO: 2,
        IN_PROGRESS: 1,
        DONE: 1,
      });
      expect(result.owner).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should return project with zero task counts when no tasks', async () => {
      repository.findOne.mockResolvedValue(mockProject);

      const result = await service.findOne('project-123');

      expect(result.taskSummary).toEqual({
        TODO: 0,
        IN_PROGRESS: 0,
        DONE: 0,
      });
    });

    it('should throw NotFoundException if project not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        "Project with ID 'nonexistent' not found",
      );
    });
  });

  describe('update', () => {
    it('should update project fields', async () => {
      const updateDto: UpdateProjectDto = {
        name: 'Updated Name',
        description: 'Updated Description',
      };

      const updatedProject = {
        ...mockProject,
        ...updateDto,
      };

      repository.findOne.mockResolvedValue(mockProject);
      repository.save.mockResolvedValue(updatedProject);

      const result = await service.update(
        'project-123',
        updateDto,
        mockUser.id,
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-123' },
        relations: ['owner'],
      });
      expect(repository.save).toHaveBeenCalled();
      expect(result.name).toBe(updateDto.name);
      expect(result.description).toBe(updateDto.description);
    });

    it('should throw NotFoundException if project not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', {}, mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      repository.findOne.mockResolvedValue(mockProject);

      await expect(
        service.update('project-123', {}, 'different-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.update('project-123', {}, 'different-user-id'),
      ).rejects.toThrow(
        'You do not have permission to update this project',
      );
    });
  });

  describe('archive', () => {
    it('should set project status to ARCHIVED', async () => {
      const archivedProject = {
        ...mockProject,
        status: ProjectStatus.ARCHIVED,
      };

      repository.findOne.mockResolvedValue(mockProject);
      repository.save.mockResolvedValue(archivedProject);

      await service.archive('project-123', mockUser.id);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'project-123' },
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProjectStatus.ARCHIVED,
        }),
      );
    });

    it('should throw NotFoundException if project not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.archive('nonexistent', mockUser.id),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner', async () => {
      repository.findOne.mockResolvedValue(mockProject);

      await expect(
        service.archive('project-123', 'different-user-id'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.archive('project-123', 'different-user-id'),
      ).rejects.toThrow(
        'You do not have permission to archive this project',
      );
    });
  });
});
