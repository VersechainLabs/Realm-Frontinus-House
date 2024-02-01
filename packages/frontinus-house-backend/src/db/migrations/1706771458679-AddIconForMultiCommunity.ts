import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIconForMultiCommunity1706771458679 implements MigrationInterface {
    name = 'AddIconForMultiCommunity1706771458679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" ADD "icon" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "community" DROP COLUMN "icon"`);
    }

}
