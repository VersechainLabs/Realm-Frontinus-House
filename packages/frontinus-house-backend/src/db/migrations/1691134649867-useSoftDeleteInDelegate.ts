import {MigrationInterface, QueryRunner} from "typeorm";

export class useSoftDeleteInDelegate1691134649867 implements MigrationInterface {
    name = 'useSoftDeleteInDelegate1691134649867'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegate" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "createdDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "lastUpdatedDate" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "lastUpdatedDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "lastUpdatedDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "lastUpdatedDate" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "delegate" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delegate" DROP COLUMN "deletedDate"`);
    }

}
