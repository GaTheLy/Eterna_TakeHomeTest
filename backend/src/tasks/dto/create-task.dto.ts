import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaskPriority } from '../entities/task.entity';

@ValidatorConstraint({ name: 'IsAfter', async: false })
export class IsAfterConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];
    
    if (!value || !relatedValue) {
      return true; // Let other validators handle required checks
    }
    
    const endDate = new Date(value);
    const startDate = new Date(relatedValue);
    
    return endDate > startDate;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `${args.property} must be after ${relatedPropertyName}`;
  }
}

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task title',
    example: 'Design homepage mockup',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

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
  })
  @IsEnum(TaskPriority)
  priority!: TaskPriority;

  @ApiProperty({
    description: 'UUID of the user assigned to this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  assigneeId!: string;

  @ApiProperty({
    description: 'Scheduled start date and time (ISO 8601)',
    example: '2024-01-15T09:00:00.000Z',
  })
  @IsDateString()
  scheduledStart!: string;

  @ApiProperty({
    description: 'Scheduled end date and time (ISO 8601), must be after scheduledStart',
    example: '2024-01-15T17:00:00.000Z',
  })
  @IsDateString()
  @Validate(IsAfterConstraint, ['scheduledStart'])
  scheduledEnd!: string;
}
