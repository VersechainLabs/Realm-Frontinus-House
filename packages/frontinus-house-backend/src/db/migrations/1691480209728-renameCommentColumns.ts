import {MigrationInterface, QueryRunner} from "typeorm";

export class renameCommentColumns1691480209728 implements MigrationInterface {
    name = 'renameCommentColumns1691480209728'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "owner" TO "address"`);
        await queryRunner.query(`ALTER TABLE "comment" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "createdDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "lastUpdatedDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "lastUpdatedDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "comment" DROP COLUMN "deletedDate"`);
        await queryRunner.query(`ALTER TABLE "comment" RENAME COLUMN "address" TO "owner"`);
    }

}
