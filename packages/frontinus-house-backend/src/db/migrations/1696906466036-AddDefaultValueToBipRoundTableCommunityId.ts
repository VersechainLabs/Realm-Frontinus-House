import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDefaultValueToBipRoundTableCommunityId1696906466036 implements MigrationInterface {
    name = 'AddDefaultValueToBipRoundTableCommunityId1696906466036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" SET DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" DROP DEFAULT`);
    }

}
