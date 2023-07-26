import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelegateAddressForVote1690188344338 implements MigrationInterface {
    name = 'AddDelegateAddressForVote1690188344338'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "delegateAddress" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "delegateAddress"`);
    }

}
