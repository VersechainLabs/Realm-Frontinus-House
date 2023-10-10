import {MigrationInterface, QueryRunner} from "typeorm";

export class DelegateAddWeightAndBlockHeight1696834490170 implements MigrationInterface {
    name = 'DelegateAddWeightAndBlockHeight1696834490170'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "communityId" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin" ALTER COLUMN "communityId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bip_round" ALTER COLUMN "communityId" DROP NOT NULL`);
    }

}
