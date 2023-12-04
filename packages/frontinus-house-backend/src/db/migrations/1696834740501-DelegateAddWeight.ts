import {MigrationInterface, QueryRunner} from "typeorm";

export class DelegateAddWeight1696834740501 implements MigrationInterface {
    name = 'DelegateAddWeight1696834740501'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegate" ADD "actualWeight" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "delegate" ADD "blockHeight" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegate" DROP COLUMN "blockHeight"`);
        await queryRunner.query(`ALTER TABLE "delegate" DROP COLUMN "actualWeight"`);
    }

}
