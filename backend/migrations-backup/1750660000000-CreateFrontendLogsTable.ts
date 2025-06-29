import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateFrontendLogsTable1750660000000 implements MigrationInterface {
    name = 'CreateFrontendLogsTable1750660000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "frontend_logs" (
                "id" SERIAL NOT NULL,
                "level" character varying NOT NULL DEFAULT 'info',
                "message" text NOT NULL,
                "context" jsonb,
                "error_stack" text,
                "user_id" integer,
                "session_id" character varying,
                "url" character varying,
                "user_agent" character varying,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_frontend_logs" PRIMARY KEY ("id")
            )
        `)

        await queryRunner.query(`
            CREATE INDEX "IDX_frontend_logs_level" ON "frontend_logs" ("level")
        `)
        
        await queryRunner.query(`
            CREATE INDEX "IDX_frontend_logs_timestamp" ON "frontend_logs" ("timestamp")
        `)
        
        await queryRunner.query(`
            CREATE INDEX "IDX_frontend_logs_user_id" ON "frontend_logs" ("user_id")
        `)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "frontend_logs"`)
    }
}