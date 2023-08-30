import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBipTables1693215928024 implements MigrationInterface {
    name = 'AddBipTables1693215928024'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bip_vote" ("id" SERIAL NOT NULL, "direction" integer NOT NULL DEFAULT '1', "address" character varying NOT NULL, "bipId" integer NOT NULL, "weight" integer NOT NULL DEFAULT '0', "actualWeight" integer NOT NULL DEFAULT '0', "blockHeight" integer, "delegateId" integer, "delegateAddress" character varying, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "deletedDate" TIMESTAMP, CONSTRAINT "PK_f318d813b42faf6906a1f8127b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bip" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "title" character varying NOT NULL, "what" text NOT NULL, "tldr" text NOT NULL, "previewImage" character varying, "voteCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "deletedAt" TIMESTAMP, CONSTRAINT "PK_37290c981f575d97785ad4131e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bip_round" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "address" character varying NOT NULL DEFAULT '', "title" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "balanceBlockTag" integer NOT NULL DEFAULT '0', "visibleStatus" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_3035f713fd75e3b38b40d4e424e" PRIMARY KEY ("id")); COMMENT ON COLUMN "bip_round"."visibleStatus" IS '0 means pending, 1 means normal'`);
        await queryRunner.query(`ALTER TABLE "bip" ADD "startTime" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bip" ADD "endTime" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bip" DROP COLUMN "endTime"`);
        await queryRunner.query(`ALTER TABLE "bip" DROP COLUMN "startTime"`);
        await queryRunner.query(`DROP TABLE "bip_round"`);
        await queryRunner.query(`DROP TABLE "bip"`);
        await queryRunner.query(`DROP TABLE "bip_vote"`);
    }

}
