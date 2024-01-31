import {MigrationInterface, QueryRunner} from "typeorm";

export class AddFieldsInCommunityTableForMultiCommunity1706669811738 implements MigrationInterface {
    name = 'AddFieldsInCommunityTableForMultiCommunity1706669811738'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" ADD "nftName" character varying`);
        await queryRunner.query(`ALTER TABLE "community" ADD "discordLink" character varying`);
        await queryRunner.query(`ALTER TABLE "community" ADD "twLink" character varying`);
        await queryRunner.query(`ALTER TABLE "community" ADD "gitLink" character varying`);
        await queryRunner.query(`ALTER TABLE "community" ADD "manualLink" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "manualLink"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "gitLink"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "twLink"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "discordLink"`);
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "nftName"`);
    }

}
