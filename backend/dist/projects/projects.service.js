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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
let ProjectsService = class ProjectsService {
    projectRepository;
    constructor(projectRepository) {
        this.projectRepository = projectRepository;
    }
    async create(dto, userId) {
        const project = this.projectRepository.create({
            ...dto,
            ownerId: userId,
            status: project_entity_1.ProjectStatus.ACTIVE,
        });
        return await this.projectRepository.save(project);
    }
    async findAll(query) {
        const { page = 1, limit = 10, search } = query;
        const skip = (page - 1) * limit;
        const whereCondition = {};
        if (search) {
            whereCondition.name = (0, typeorm_2.ILike)(`%${search}%`);
        }
        const [data, total] = await this.projectRepository.findAndCount({
            where: whereCondition,
            relations: ['owner'],
            skip,
            take: limit,
            order: {
                createdAt: 'DESC',
            },
        });
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['owner', 'tasks'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID '${id}' not found`);
        }
        const taskSummary = {
            TODO: 0,
            IN_PROGRESS: 0,
            DONE: 0,
        };
        if (project.tasks) {
            project.tasks.forEach((task) => {
                if (task.status === task_entity_1.TaskStatus.TODO) {
                    taskSummary.TODO++;
                }
                else if (task.status === task_entity_1.TaskStatus.IN_PROGRESS) {
                    taskSummary.IN_PROGRESS++;
                }
                else if (task.status === task_entity_1.TaskStatus.DONE) {
                    taskSummary.DONE++;
                }
            });
        }
        return {
            id: project.id,
            name: project.name,
            description: project.description,
            status: project.status,
            owner: {
                id: project.owner.id,
                name: project.owner.name,
                email: project.owner.email,
            },
            taskSummary,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
    async update(id, dto, userId) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['owner'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID '${id}' not found`);
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to update this project');
        }
        Object.assign(project, dto);
        return await this.projectRepository.save(project);
    }
    async archive(id, userId) {
        const project = await this.projectRepository.findOne({
            where: { id },
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID '${id}' not found`);
        }
        if (project.ownerId !== userId) {
            throw new common_1.ForbiddenException('You do not have permission to archive this project');
        }
        project.status = project_entity_1.ProjectStatus.ARCHIVED;
        await this.projectRepository.save(project);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map