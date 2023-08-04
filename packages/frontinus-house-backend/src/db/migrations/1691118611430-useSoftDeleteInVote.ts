import {MigrationInterface, QueryRunner} from "typeorm";

export class useSoftDeleteInVote1691118611430 implements MigrationInterface {
    name = 'useSoftDeleteInVote1691118611430'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "vote" ALTER COLUMN "createdDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "deletedDate"`);
    }

}
