import {MigrationInterface, QueryRunner} from "typeorm";

export class addCommentCount1690971033192 implements MigrationInterface {
    name = 'addCommentCount1690971033192'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" ADD "commentCount" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "application" ADD "commentCount" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "commentCount"`);
        await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "commentCount"`);
    }

}
