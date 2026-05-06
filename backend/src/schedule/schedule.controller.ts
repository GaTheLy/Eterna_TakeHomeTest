import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';
import { ScheduleQueryDto } from './dto/schedule-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Schedule')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks within a date range' })
  @ApiResponse({ status: 200, description: 'List of scheduled tasks' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSchedule(@Query() query: ScheduleQueryDto) {
    return this.scheduleService.getSchedule(query);
  }

  @Get('conflicts')
  @ApiOperation({ summary: 'Get tasks with overlapping schedules for the same assignee' })
  @ApiResponse({ status: 200, description: 'List of conflicts grouped by assignee' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getConflicts() {
    return this.scheduleService.detectConflicts();
  }
}
