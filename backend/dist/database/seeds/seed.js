"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const user_entity_1 = require("../../users/entities/user.entity");
const project_entity_1 = require("../../projects/entities/project.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const bcrypt = __importStar(require("bcrypt"));
async function seed() {
    console.log('🌱 Starting database seeding...');
    await data_source_1.AppDataSource.initialize();
    console.log('✅ Database connection established');
    const userRepository = data_source_1.AppDataSource.getRepository(user_entity_1.User);
    const projectRepository = data_source_1.AppDataSource.getRepository(project_entity_1.Project);
    const taskRepository = data_source_1.AppDataSource.getRepository(task_entity_1.Task);
    console.log('🧹 Clearing existing data...');
    await taskRepository.delete({});
    await projectRepository.delete({});
    await userRepository.delete({});
    console.log('✅ Existing data cleared');
    console.log('👤 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const adminUser = userRepository.create({
        name: 'Admin User',
        email: 'admin@example.com',
        password: hashedPassword,
        role: user_entity_1.UserRole.ADMIN,
    });
    const memberUser = userRepository.create({
        name: 'Member User',
        email: 'member@example.com',
        password: hashedPassword,
        role: user_entity_1.UserRole.MEMBER,
    });
    await userRepository.save([adminUser, memberUser]);
    console.log(`✅ Created 2 users: ${adminUser.email}, ${memberUser.email}`);
    console.log('📁 Creating projects...');
    const project1 = projectRepository.create({
        name: 'Website Redesign',
        description: 'Complete overhaul of company website with modern design and improved UX',
        status: project_entity_1.ProjectStatus.ACTIVE,
        ownerId: adminUser.id,
    });
    const project2 = projectRepository.create({
        name: 'Mobile App Development',
        description: 'Native mobile application for iOS and Android platforms',
        status: project_entity_1.ProjectStatus.ACTIVE,
        ownerId: memberUser.id,
    });
    const project3 = projectRepository.create({
        name: 'Legacy System Migration',
        description: 'Migration of legacy monolith to microservices architecture',
        status: project_entity_1.ProjectStatus.ARCHIVED,
        ownerId: adminUser.id,
    });
    await projectRepository.save([project1, project2, project3]);
    console.log(`✅ Created 3 projects: ${project1.name}, ${project2.name}, ${project3.name}`);
    console.log('📋 Creating tasks...');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tasks = [
        taskRepository.create({
            title: 'Design homepage mockup',
            description: 'Create high-fidelity mockup in Figma with new branding',
            priority: task_entity_1.TaskPriority.HIGH,
            status: task_entity_1.TaskStatus.DONE,
            projectId: project1.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Implement responsive navigation',
            description: 'Build mobile-friendly navigation component with hamburger menu',
            priority: task_entity_1.TaskPriority.URGENT,
            status: task_entity_1.TaskStatus.IN_PROGRESS,
            projectId: project1.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Optimize images and assets',
            description: 'Compress and optimize all images for web performance',
            priority: task_entity_1.TaskPriority.MEDIUM,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project1.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Setup analytics tracking',
            description: 'Integrate Google Analytics and setup conversion tracking',
            priority: task_entity_1.TaskPriority.LOW,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project1.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Setup React Native project',
            description: 'Initialize React Native project with TypeScript and navigation',
            priority: task_entity_1.TaskPriority.URGENT,
            status: task_entity_1.TaskStatus.DONE,
            projectId: project2.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Implement user authentication',
            description: 'Build login/register screens with JWT authentication',
            priority: task_entity_1.TaskPriority.HIGH,
            status: task_entity_1.TaskStatus.IN_PROGRESS,
            projectId: project2.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Design app icon and splash screen',
            description: 'Create app icon in multiple sizes and animated splash screen',
            priority: task_entity_1.TaskPriority.MEDIUM,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project2.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Setup push notifications',
            description: 'Integrate Firebase Cloud Messaging for push notifications',
            priority: task_entity_1.TaskPriority.HIGH,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project2.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Analyze legacy codebase',
            description: 'Document existing system architecture and dependencies',
            priority: task_entity_1.TaskPriority.HIGH,
            status: task_entity_1.TaskStatus.DONE,
            projectId: project3.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Design microservices architecture',
            description: 'Create architecture diagram and service boundaries',
            priority: task_entity_1.TaskPriority.URGENT,
            status: task_entity_1.TaskStatus.DONE,
            projectId: project3.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() - 24 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Implement API gateway',
            description: 'Setup Kong API gateway with authentication and rate limiting',
            priority: task_entity_1.TaskPriority.MEDIUM,
            status: task_entity_1.TaskStatus.IN_PROGRESS,
            projectId: project3.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Code review session',
            description: 'Review pull requests and provide feedback',
            priority: task_entity_1.TaskPriority.MEDIUM,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project1.id,
            assigneeId: memberUser.id,
            scheduledStart: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000),
        }),
        taskRepository.create({
            title: 'Team standup meeting',
            description: 'Daily standup with development team',
            priority: task_entity_1.TaskPriority.LOW,
            status: task_entity_1.TaskStatus.TODO,
            projectId: project2.id,
            assigneeId: adminUser.id,
            scheduledStart: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000),
            scheduledEnd: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000),
        }),
    ];
    await taskRepository.save(tasks);
    console.log(`✅ Created ${tasks.length} tasks with varied priorities, statuses, and schedules`);
    console.log('   - Including 2 overlapping task pairs for conflict testing');
    console.log('\n📊 Seeding Summary:');
    console.log(`   Users: ${await userRepository.count()}`);
    console.log(`   Projects: ${await projectRepository.count()}`);
    console.log(`   Tasks: ${await taskRepository.count()}`);
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Admin: admin@example.com / password123');
    console.log('   Member: member@example.com / password123');
    await data_source_1.AppDataSource.destroy();
}
seed()
    .then(() => {
    console.log('\n✅ Seeder script finished');
    process.exit(0);
})
    .catch((error) => {
    console.error('\n❌ Seeder script failed:', error);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map