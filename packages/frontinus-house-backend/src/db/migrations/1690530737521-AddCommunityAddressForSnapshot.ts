import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommunityAddressForSnapshot1690530737521 implements MigrationInterface {
    name = 'AddCommunityAddressForSnapshot1690530737521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "snapshot" ADD "communityAddress" character varying NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "snapshot"."communityAddress" IS 'communityAddress in communities, used to confirm the voting power strategy'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "snapshot"."communityAddress" IS 'communityAddress in communities, used to confirm the voting power strategy'`);
        await queryRunner.query(`ALTER TABLE "snapshot" DROP COLUMN "communityAddress"`);
    }

}
