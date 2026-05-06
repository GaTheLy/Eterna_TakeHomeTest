import {
  IsString,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'Website Redesign',
    required: false,
    maxLength: 255,
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Complete overhaul of company website',
    required: false,
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
    required: false,
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;
}
