import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

describe('ScheduleController', () => {
  let controller: ScheduleController;
  let service: ScheduleService;

  const mockScheduleService = {
    getSchedule: jest.fn(),
    detectConflicts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        {
          provide: ScheduleService,
          useValue: mockScheduleService,
        },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSchedule', () => {
    it('should call scheduleService.getSchedule with query params', async () => {
      const query = {
        start: '2024-01-15T00:00:00.000Z',
        end: '2024-01-15T23:59:59.999Z',
      };

      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          scheduledStart: new Date('2024-01-15T09:00:00.000Z'),
          scheduledEnd: new Date('2024-01-15T12:00:00.000Z'),
        },
      ];

      mockScheduleService.getSchedule.mockResolvedValue(mockTasks);

      const result = await controller.getSchedule(query);

      expect(service.getSchedule).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockTasks);
    });
  });

  describe('getConflicts', () => {
    it('should call scheduleService.detectConflicts', async () => {
      const mockConflicts = [
        {
          assignee: {
            id: 'user-1',
            name: 'Test User',
            email: 'test@example.com',
          },
          conflictingTasks: [
            {
              id: 'task-1',
              title: 'Task 1',
              projectName: 'Project 1',
              scheduledStart: new Date('2024-01-15T09:00:00.000Z'),
              scheduledEnd: new Date('2024-01-15T12:00:00.000Z'),
            },
          ],
        },
      ];

      mockScheduleService.detectConflicts.mockResolvedValue(mockConflicts);

      const result = await controller.getConflicts();

      expect(service.detectConflicts).toHaveBeenCalled();
      expect(result).toEqual(mockConflicts);
    });
  });
});
