import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBipComment1693552487147 implements MigrationInterface {
    name = 'AddBipComment1693552487147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bip_comment" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "content" character varying NOT NULL, "address" character varying NOT NULL, "bipRoundId" integer, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP DEFAULT now(), "deletedDate" TIMESTAMP, CONSTRAINT "PK_f3364aa6f7e3919bd9d83c761e0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bip_comment"`);
    }

}
