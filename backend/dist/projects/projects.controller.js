"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const projects_service_1 = require("./projects.service");
const create_project_dto_1 = require("./dto/create-project.dto");
const update_project_dto_1 = require("./dto/update-project.dto");
const project_query_dto_1 = require("./dto/project-query.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ProjectsController = class ProjectsController {
    projectsService;
    constructor(projectsService) {
        this.projectsService = projectsService;
    }
    async findAll(query) {
        return await this.projectsService.findAll(query);
    }
    async create(createProjectDto, user) {
        return await this.projectsService.create(createProjectDto, user.id);
    }
    async findOne(id) {
        return await this.projectsService.findOne(id);
    }
    async update(id, updateProjectDto, user) {
        return await this.projectsService.update(id, updateProjectDto, user.id);
    }
    async archive(id, user) {
        await this.projectsService.archive(id, user.id);
    }
};
exports.ProjectsController = ProjectsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'List all projects',
        description: 'Retrieve a paginated list of projects with optional search filtering by name. ' +
            'Returns projects with owner information and metadata for pagination.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Missing or invalid JWT token',
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_query_dto_1.ProjectQueryDto]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new project',
        description: 'Create a new project with the authenticated user as the owner. ' +
            'The project status is automatically set to ACTIVE.',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Missing or invalid JWT token',
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_project_dto_1.CreateProjectDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get project details',
        description: 'Retrieve detailed information about a specific project, including task count grouped by status (TODO, IN_PROGRESS, DONE).',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Project UUID',
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Missing or invalid JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Project does not exist',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: { type: 'string', example: 'Project with ID "123" not found' },
            },
        },
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update project',
        description: 'Update project information. Only the project owner or an admin can update the project. ' +
            'All fields are optional - only provided fields will be updated.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Project UUID',
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
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
    }),
    (0, swagger_1.ApiResponse)({
        status: 400,
        description: 'Bad Request - Invalid input data (validation errors)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Missing or invalid JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User is not the project owner or admin',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 403 },
                message: { type: 'string', example: 'You do not have permission to update this project' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Project does not exist',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_project_dto_1.UpdateProjectDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({
        summary: 'Archive project',
        description: 'Archive a project by setting its status to ARCHIVED (soft delete). ' +
            'Only the project owner or an admin can archive the project. ' +
            'Returns 204 No Content on success.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'Project UUID',
        type: 'string',
        format: 'uuid',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    (0, swagger_1.ApiResponse)({
        status: 204,
        description: 'Project archived successfully (no content returned)',
    }),
    (0, swagger_1.ApiResponse)({
        status: 401,
        description: 'Unauthorized - Missing or invalid JWT token',
    }),
    (0, swagger_1.ApiResponse)({
        status: 403,
        description: 'Forbidden - User is not the project owner or admin',
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 403 },
                message: { type: 'string', example: 'You do not have permission to archive this project' },
            },
        },
    }),
    (0, swagger_1.ApiResponse)({
        status: 404,
        description: 'Not Found - Project does not exist',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], ProjectsController.prototype, "archive", null);
exports.ProjectsController = ProjectsController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.Controller)('projects'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [projects_service_1.ProjectsService])
], ProjectsController);
//# sourceMappingURL=projects.controller.js.map