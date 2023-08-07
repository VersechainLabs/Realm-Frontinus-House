import {MigrationInterface, QueryRunner} from "typeorm";

export class addVisibleStatusForAuction1691398223352 implements MigrationInterface {
    name = 'addVisibleStatusForAuction1691398223352'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ADD "visibleStatus" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`COMMENT ON COLUMN "auction"."visibleStatus" IS '0 means pending, 1 means normal'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "auction"."visibleStatus" IS '0 means pending, 1 means normal'`);
        await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "visibleStatus"`);
    }

}
