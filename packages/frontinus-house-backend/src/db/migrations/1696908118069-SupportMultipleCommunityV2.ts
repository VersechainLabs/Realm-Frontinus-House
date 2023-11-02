import {MigrationInterface, QueryRunner} from "typeorm";

export class SupportMultipleCommunityV21696908118069 implements MigrationInterface {
    name = 'SupportMultipleCommunityV21696908118069'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ADD "communityId" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "delegation" ADD "communityId" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "communityId" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "communityId"`);
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "communityId"`);
        await queryRunner.query(`ALTER TABLE "bip_round" DROP COLUMN "communityId"`);
    }

}
