import {MigrationInterface, QueryRunner} from "typeorm";

export class DelegationTableAddCommunity1696837344291 implements MigrationInterface {
    name = 'DelegationTableAddCommunity1696837344291'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegation" ADD "communityId" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "communityId"`);
    }

}
