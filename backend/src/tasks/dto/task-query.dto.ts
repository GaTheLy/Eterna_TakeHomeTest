import { IsOptional, IsEnum, IsUUID, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../entities/task.entity';

export class TaskQueryDto {
  @ApiProperty({
    description: 'Filter by task status',
    enum: TaskStatus,
    required: false,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'Filter by task priority',
    enum: TaskPriority,
    required: false,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Filter by assignee UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'Sort by field',
    enum: ['scheduledStart', 'priority'],
    required: false,
  })
  @IsIn(['scheduledStart', 'priority'])
  @IsOptional()
  sortBy?: 'scheduledStart' | 'priority';

  @ApiProperty({
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
    required: false,
    default: 'ASC',
  })
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC';
}
