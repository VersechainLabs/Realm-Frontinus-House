import {MigrationInterface, QueryRunner} from "typeorm";

export class addApplicationidToComment1690860255405 implements MigrationInterface {
    name = 'addApplicationidToComment1690860255405'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ADD "applicationId" integer`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "proposalId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "proposalId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "applicationId"`);
    }

}
