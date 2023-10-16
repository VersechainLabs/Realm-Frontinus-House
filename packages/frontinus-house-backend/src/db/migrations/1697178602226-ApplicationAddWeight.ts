import {MigrationInterface, QueryRunner} from "typeorm";

export class ApplicationAddWeight1697178602226 implements MigrationInterface {
    name = 'ApplicationAddWeight1697178602226'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "actualWeight" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "application" ADD "blockHeight" integer`);
        await queryRunner.query(`ALTER TABLE "application" ADD "sumWeight" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "sumWeight"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "blockHeight"`);
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "actualWeight"`);
    }

}
