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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskQueryDto } from './dto/task-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Create a new task for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Project or Assignee not found' })
  async create(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return await this.tasksService.create(projectId, createTaskDto);
  }

  @Get('projects/:projectId/tasks')
  @ApiOperation({ summary: 'Get all tasks for a project' })
  @ApiParam({ name: 'projectId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'List of tasks' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return await this.tasksService.findByProject(projectId, query);
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tasksService.delete(id);
  }
}
