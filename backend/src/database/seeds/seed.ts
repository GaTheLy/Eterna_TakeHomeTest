import { AppDataSource } from '../data-source';
import { User, UserRole } from '../../users/entities/user.entity';
import { Project, ProjectStatus } from '../../projects/entities/project.entity';
import { Task, TaskPriority, TaskStatus } from '../../tasks/entities/task.entity';
import * as bcrypt from 'bcrypt';

/**
 * Database Seeder Script
 * 
 * This script populates the database with sample data for testing and development.
 * It creates:
 * - 2 users (admin and member)
 * - 3 projects with varied statuses
 * - 10+ tasks with varied priorities, statuses, and schedules
 * - At least 2 overlapping tasks for conflict testing
 * 
 * Usage: npm run seed
 */

async function seed() {
  console.log('🌱 Starting database seeding...');

  // Initialize data source
  await AppDataSource.initialize();
  console.log('✅ Database connection established');

  const userRepository = AppDataSource.getRepository(User);
  const projectRepository = AppDataSource.getRepository(Project);
  const taskRepository = AppDataSource.getRepository(Task);

  // Clear existing data with CASCADE to handle foreign key constraints
  console.log('🧹 Clearing existing data...');
  await AppDataSource.query('TRUNCATE TABLE "tasks", "projects", "users" RESTART IDENTITY CASCADE');
  console.log('✅ Existing data cleared');

  // Create users
  console.log('👤 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const adminUser = userRepository.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password: hashedPassword,
    role: UserRole.ADMIN,
  });

  const memberUser = userRepository.create({
    name: 'Member User',
    email: 'member@example.com',
    password: hashedPassword,
    role: UserRole.MEMBER,
  });

  await userRepository.save([adminUser, memberUser]);
  console.log(`✅ Created 2 users: ${adminUser.email}, ${memberUser.email}`);

  // Create projects
  console.log('📁 Creating projects...');
  
  const project1 = projectRepository.create({
    name: 'Website Redesign',
    description: 'Complete overhaul of company website with modern design and improved UX',
    status: ProjectStatus.ACTIVE,
    ownerId: adminUser.id,
  });

  const project2 = projectRepository.create({
    name: 'Mobile App Development',
    description: 'Native mobile application for iOS and Android platforms',
    status: ProjectStatus.ACTIVE,
    ownerId: memberUser.id,
  });

  const project3 = projectRepository.create({
    name: 'Legacy System Migration',
    description: 'Migration of legacy monolith to microservices architecture',
    status: ProjectStatus.ARCHIVED,
    ownerId: adminUser.id,
  });

  await projectRepository.save([project1, project2, project3]);
  console.log(`✅ Created 3 projects: ${project1.name}, ${project2.name}, ${project3.name}`);

  // Create tasks with varied priorities, statuses, and schedules
  console.log('📋 Creating tasks...');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const tasks = [
    // Project 1 tasks - Website Redesign
    taskRepository.create({
      title: 'Design homepage mockup',
      description: 'Create high-fidelity mockup in Figma with new branding',
      priority: TaskPriority.HIGH,
      status: TaskStatus.DONE,
      projectId: project1.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      scheduledEnd: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    }),
    taskRepository.create({
      title: 'Implement responsive navigation',
      description: 'Build mobile-friendly navigation component with hamburger menu',
      priority: TaskPriority.URGENT,
      status: TaskStatus.IN_PROGRESS,
      projectId: project1.id,
      assigneeId: adminUser.id,
      scheduledStart: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      scheduledEnd: new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000), // tomorrow
    }),
    taskRepository.create({
      title: 'Optimize images and assets',
      description: 'Compress and optimize all images for web performance',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project1.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      scheduledEnd: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    }),
    taskRepository.create({
      title: 'Setup analytics tracking',
      description: 'Integrate Google Analytics and setup conversion tracking',
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      projectId: project1.id,
      assigneeId: adminUser.id,
      scheduledStart: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      scheduledEnd: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
    }),

    // Project 2 tasks - Mobile App Development
    taskRepository.create({
      title: 'Setup React Native project',
      description: 'Initialize React Native project with TypeScript and navigation',
      priority: TaskPriority.URGENT,
      status: TaskStatus.DONE,
      projectId: project2.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      scheduledEnd: new Date(today.getTime() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    }),
    taskRepository.create({
      title: 'Implement user authentication',
      description: 'Build login/register screens with JWT authentication',
      priority: TaskPriority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      projectId: project2.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), // yesterday
      scheduledEnd: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    }),
    taskRepository.create({
      title: 'Design app icon and splash screen',
      description: 'Create app icon in multiple sizes and animated splash screen',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project2.id,
      assigneeId: adminUser.id,
      scheduledStart: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      scheduledEnd: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    }),
    taskRepository.create({
      title: 'Setup push notifications',
      description: 'Integrate Firebase Cloud Messaging for push notifications',
      priority: TaskPriority.HIGH,
      status: TaskStatus.TODO,
      projectId: project2.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      scheduledEnd: new Date(today.getTime() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
    }),

    // Project 3 tasks - Legacy System Migration (Archived project)
    taskRepository.create({
      title: 'Analyze legacy codebase',
      description: 'Document existing system architecture and dependencies',
      priority: TaskPriority.HIGH,
      status: TaskStatus.DONE,
      projectId: project3.id,
      assigneeId: adminUser.id,
      scheduledStart: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      scheduledEnd: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000), // 25 days ago
    }),
    taskRepository.create({
      title: 'Design microservices architecture',
      description: 'Create architecture diagram and service boundaries',
      priority: TaskPriority.URGENT,
      status: TaskStatus.DONE,
      projectId: project3.id,
      assigneeId: adminUser.id,
      scheduledStart: new Date(today.getTime() - 24 * 24 * 60 * 60 * 1000), // 24 days ago
      scheduledEnd: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    }),
    taskRepository.create({
      title: 'Implement API gateway',
      description: 'Setup Kong API gateway with authentication and rate limiting',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.IN_PROGRESS,
      projectId: project3.id,
      assigneeId: memberUser.id,
      scheduledStart: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      scheduledEnd: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    }),

    // Additional tasks for conflict testing
    // CONFLICT 1: memberUser has overlapping tasks on the same day
    taskRepository.create({
      title: 'Code review session',
      description: 'Review pull requests and provide feedback',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.TODO,
      projectId: project1.id,
      assigneeId: memberUser.id,
      // Overlaps with "Optimize images and assets" task
      scheduledStart: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 days + 2 hours
      scheduledEnd: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 2 days + 6 hours
    }),

    // CONFLICT 2: adminUser has overlapping tasks
    taskRepository.create({
      title: 'Team standup meeting',
      description: 'Daily standup with development team',
      priority: TaskPriority.LOW,
      status: TaskStatus.TODO,
      projectId: project2.id,
      assigneeId: adminUser.id,
      // Overlaps with "Design app icon and splash screen" task
      scheduledStart: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 3 days + 1 hour
      scheduledEnd: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 days + 3 hours
    }),
  ];

  await taskRepository.save(tasks);
  console.log(`✅ Created ${tasks.length} tasks with varied priorities, statuses, and schedules`);
  console.log('   - Including 2 overlapping task pairs for conflict testing');

  // Summary
  console.log('\n📊 Seeding Summary:');
  console.log(`   Users: ${await userRepository.count()}`);
  console.log(`   Projects: ${await projectRepository.count()}`);
  console.log(`   Tasks: ${await taskRepository.count()}`);
  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@example.com / password123');
  console.log('   Member: member@example.com / password123');

  // Close connection
  await AppDataSource.destroy();
}

// Run the seeder
seed()
  .then(() => {
    console.log('\n✅ Seeder script finished');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeder script failed:', error);
    process.exit(1);
  });
