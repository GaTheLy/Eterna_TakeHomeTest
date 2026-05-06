import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { ScheduleQueryDto } from './dto/schedule-query.dto';

export interface ScheduleConflict {
  assignee: {
    id: string;
    name: string;
    email: string;
  };
  conflictingTasks: Array<{
    id: string;
    title: string;
    projectName: string;
    scheduledStart: Date;
    scheduledEnd: Date;
  }>;
}

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Task)
    private tasksRepository: Repository<Task>,
  ) {}

  async getSchedule(query: ScheduleQueryDto): Promise<Task[]> {
    const { start, end } = query;
    return this.tasksRepository.find({
      where: {
        scheduledStart: LessThanOrEqual(new Date(end)),
        scheduledEnd: MoreThanOrEqual(new Date(start)),
      },
      relations: ['project', 'assignee'],
      order: {
        scheduledStart: 'ASC',
      },
    });
  }

  async detectConflicts(): Promise<ScheduleConflict[]> {
    const tasks = await this.tasksRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.assignee', 'assignee')
      .leftJoinAndSelect('task.project', 'project')
      .where('task.status != :status', { status: 'DONE' })
      .orderBy('task.scheduledStart', 'ASC')
      .getMany();

    const conflictsByAssignee = new Map<string, Task[]>();

    for (const task of tasks) {
      if (!conflictsByAssignee.has(task.assigneeId)) {
        conflictsByAssignee.set(task.assigneeId, []);
      }
      conflictsByAssignee.get(task.assigneeId)!.push(task);
    }

    const results: ScheduleConflict[] = [];

    for (const [_assigneeId, userTasks] of conflictsByAssignee.entries()) {
      const conflictingTasks = new Set<Task>();

      for (let i = 0; i < userTasks.length; i++) {
        for (let j = i + 1; j < userTasks.length; j++) {
          const t1 = userTasks[i];
          const t2 = userTasks[j];

          // Check if tasks overlap
          if (t1.scheduledStart < t2.scheduledEnd && t2.scheduledStart < t1.scheduledEnd) {
            conflictingTasks.add(t1);
            conflictingTasks.add(t2);
          }
        }
      }

      if (conflictingTasks.size > 0) {
        const sortedConflicts = Array.from(conflictingTasks).sort(
          (a, b) => a.scheduledStart.getTime() - b.scheduledStart.getTime(),
        );

        const assignee = sortedConflicts[0].assignee;
        results.push({
          assignee: {
            id: assignee.id,
            name: assignee.name,
            email: assignee.email,
          },
          conflictingTasks: sortedConflicts.map((t) => ({
            id: t.id,
            title: t.title,
            projectName: t.project.name,
            scheduledStart: t.scheduledStart,
            scheduledEnd: t.scheduledEnd,
          })),
        });
      }
    }

    return results;
  }
}
