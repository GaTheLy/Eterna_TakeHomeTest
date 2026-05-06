import { IsDateString, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsAfterConstraint } from '../../tasks/dto/create-task.dto';

export class ScheduleQueryDto {
  @ApiProperty({
    description: 'Start date and time (ISO 8601)',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsDateString()
  start!: string;

  @ApiProperty({
    description: 'End date and time (ISO 8601), must be after start',
    example: '2024-01-31T23:59:59.000Z',
  })
  @IsDateString()
  @Validate(IsAfterConstraint, ['start'])
  end!: string;
}
