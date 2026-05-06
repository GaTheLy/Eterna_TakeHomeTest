import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectQueryDto } from './dto/project-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Projects')
@ApiBearerAuth('JWT-auth')
@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * GET /projects
   * List all projects with pagination and search
   */
  @Get()
  @ApiOperation({
    summary: 'List all projects',
    description:
      'Retrieve a paginated list of projects with optional search filtering by name. ' +
      'Returns projects with owner information and metadata for pagination.',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
              name: { type: 'string', example: 'Website Redesign' },
              description: { type: 'string', example: 'Complete overhaul of company website' },
              status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], example: 'ACTIVE' },
              owner: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                },
              },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
              updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async findAll(@Query() query: ProjectQueryDto) {
    return await this.projectsService.findAll(query);
  }

  /**
   * POST /projects
   * Create a new project
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description:
      'Create a new project with the authenticated user as the owner. ' +
      'The project status is automatically set to ACTIVE.',
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Website Redesign' },
        description: { type: 'string', example: 'Complete overhaul of company website' },
        status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], example: 'ACTIVE' },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data (validation errors)',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        errors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              field: { type: 'string', example: 'name' },
              message: { type: 'string', example: 'name should not be empty' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @CurrentUser() user: User,
  ) {
    return await this.projectsService.create(createProjectDto, user.id);
  }

  /**
   * GET /projects/:id
   * Get project details with task summary
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get project details',
    description:
      'Retrieve detailed information about a specific project, including task count grouped by status (TODO, IN_PROGRESS, DONE).',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Project details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Website Redesign' },
        description: { type: 'string', example: 'Complete overhaul of company website' },
        status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], example: 'ACTIVE' },
        owner: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
          },
        },
        taskSummary: {
          type: 'object',
          properties: {
            TODO: { type: 'number', example: 5 },
            IN_PROGRESS: { type: 'number', example: 3 },
            DONE: { type: 'number', example: 2 },
          },
        },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Project does not exist',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Project with ID "123" not found' },
      },
    },
  })
  async findOne(@Param('id') id: string) {
    return await this.projectsService.findOne(id);
  }

  /**
   * PATCH /projects/:id
   * Update project information
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update project',
    description:
      'Update project information. Only the project owner or an admin can update the project. ' +
      'All fields are optional - only provided fields will be updated.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
        name: { type: 'string', example: 'Website Redesign' },
        description: { type: 'string', example: 'Complete overhaul of company website' },
        status: { type: 'string', enum: ['ACTIVE', 'ARCHIVED'], example: 'ACTIVE' },
        ownerId: { type: 'string', format: 'uuid' },
        createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
        updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00.000Z' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data (validation errors)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the project owner or admin',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You do not have permission to update this project' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Project does not exist',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return await this.projectsService.update(id, updateProjectDto, user.id);
  }

  /**
   * DELETE /projects/:id
   * Archive a project (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Archive project',
    description:
      'Archive a project by setting its status to ARCHIVED (soft delete). ' +
      'Only the project owner or an admin can archive the project. ' +
      'Returns 204 No Content on success.',
  })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: 'string',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Project archived successfully (no content returned)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not the project owner or admin',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 403 },
        message: { type: 'string', example: 'You do not have permission to archive this project' },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found - Project does not exist',
  })
  async archive(@Param('id') id: string, @CurrentUser() user: User) {
    await this.projectsService.archive(id, user.id);
  }
}
