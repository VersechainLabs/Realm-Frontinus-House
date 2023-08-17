import {MigrationInterface, QueryRunner} from "typeorm";

export class addDeleteDateForAuction1692086406229 implements MigrationInterface {
    name = 'addDeleteDateForAuction1692086406229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "createdDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "lastUpdatedDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "lastUpdatedDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "deletedAt"`);
    }

}
