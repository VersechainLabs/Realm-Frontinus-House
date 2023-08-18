import {MigrationInterface, QueryRunner} from "typeorm";

export class addPreviewImageInProposal1692169632474 implements MigrationInterface {
    name = 'addPreviewImageInProposal1692169632474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" ADD "previewImage" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposal" DROP COLUMN "previewImage"`);
    }

}
