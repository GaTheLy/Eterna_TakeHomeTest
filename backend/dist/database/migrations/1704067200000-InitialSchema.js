"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitialSchema1704067200000 = void 0;
class InitialSchema1704067200000 {
    name = 'InitialSchema1704067200000';
    async up(queryRunner) {
        await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('ADMIN', 'MEMBER')
    `);
        await queryRunner.query(`
      CREATE TYPE "project_status_enum" AS ENUM ('ACTIVE', 'ARCHIVED')
    `);
        await queryRunner.query(`
      CREATE TYPE "task_priority_enum" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT')
    `);
        await queryRunner.query(`
      CREATE TYPE "task_status_enum" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE')
    `);
        await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'MEMBER',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_users_email" ON "users" ("email")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_users_email_lookup" ON "users" ("email")
    `);
        await queryRunner.query(`
      CREATE TABLE "projects" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(255) NOT NULL,
        "description" text,
        "status" "project_status_enum" NOT NULL DEFAULT 'ACTIVE',
        "owner_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_projects_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "projects"
      ADD CONSTRAINT "FK_projects_owner_id"
      FOREIGN KEY ("owner_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_projects_owner_id" ON "projects" ("owner_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_projects_status" ON "projects" ("status")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_projects_name" ON "projects" ("name")
    `);
        await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "priority" "task_priority_enum" NOT NULL,
        "status" "task_status_enum" NOT NULL DEFAULT 'TODO',
        "project_id" uuid NOT NULL,
        "assignee_id" uuid NOT NULL,
        "scheduled_start" TIMESTAMP NOT NULL,
        "scheduled_end" TIMESTAMP NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id")
      )
    `);
        await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_project_id"
      FOREIGN KEY ("project_id")
      REFERENCES "projects"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "FK_tasks_assignee_id"
      FOREIGN KEY ("assignee_id")
      REFERENCES "users"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);
        await queryRunner.query(`
      ALTER TABLE "tasks"
      ADD CONSTRAINT "CHK_tasks_scheduled_dates"
      CHECK ("scheduled_end" > "scheduled_start")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_project_id" ON "tasks" ("project_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_assignee_id" ON "tasks" ("assignee_id")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_status" ON "tasks" ("status")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_priority" ON "tasks" ("priority")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_scheduled_start" ON "tasks" ("scheduled_start")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_scheduled_end" ON "tasks" ("scheduled_end")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_assignee_schedule" ON "tasks" ("assignee_id", "scheduled_start", "scheduled_end")
    `);
        await queryRunner.query(`
      CREATE INDEX "IDX_tasks_project_status" ON "tasks" ("project_id", "status")
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TABLE "projects"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "task_status_enum"`);
        await queryRunner.query(`DROP TYPE "task_priority_enum"`);
        await queryRunner.query(`DROP TYPE "project_status_enum"`);
        await queryRunner.query(`DROP TYPE "user_role_enum"`);
    }
}
exports.InitialSchema1704067200000 = InitialSchema1704067200000;
//# sourceMappingURL=1704067200000-InitialSchema.js.map