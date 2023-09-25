import {MigrationInterface, QueryRunner} from "typeorm";

export class SupportMultipleCommunity1695627620412 implements MigrationInterface {
    name = 'SupportMultipleCommunity1695627620412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ADD "communityId" integer`);
        await queryRunner.query(`ALTER TABLE "admin" ADD "communityId" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" DROP COLUMN "communityId"`);
        await queryRunner.query(`ALTER TABLE "bip_round" DROP COLUMN "communityId"`);
    }

}
