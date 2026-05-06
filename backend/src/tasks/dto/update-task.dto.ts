import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
  IsUUID,
  IsDateString,
  Validate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '../entities/task.entity';
import { IsAfterConstraint } from './create-task.dto';

export class UpdateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Design homepage mockup',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Task description',
    example: 'Create high-fidelity mockup in Figma',
    required: false,
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description: 'Task priority level',
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    required: false,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.IN_PROGRESS,
    required: false,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    description: 'UUID of the user assigned to this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiProperty({
    description: 'Scheduled start date and time (ISO 8601)',
    example: '2024-01-15T09:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  scheduledStart?: string;

  @ApiProperty({
    description: 'Scheduled end date and time (ISO 8601), must be after scheduledStart',
    example: '2024-01-15T17:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  @Validate(IsAfterConstraint, ['scheduledStart'])
  scheduledEnd?: string;
}
