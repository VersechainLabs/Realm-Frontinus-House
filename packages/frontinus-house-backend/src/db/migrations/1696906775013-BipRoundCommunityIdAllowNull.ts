import {MigrationInterface, QueryRunner} from "typeorm";

export class BipRoundCommunityIdAllowNull1696906775013 implements MigrationInterface {
    name = 'BipRoundCommunityIdAllowNull1696906775013'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" SET NOT NULL`);
    }

}
