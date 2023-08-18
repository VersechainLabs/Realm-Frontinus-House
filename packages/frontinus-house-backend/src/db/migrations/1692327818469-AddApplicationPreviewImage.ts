import {MigrationInterface, QueryRunner} from "typeorm";

export class AddApplicationPreviewImage1692327818469 implements MigrationInterface {
    name = 'AddApplicationPreviewImage1692327818469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" ADD "previewImage" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "previewImage"`);
    }

}
