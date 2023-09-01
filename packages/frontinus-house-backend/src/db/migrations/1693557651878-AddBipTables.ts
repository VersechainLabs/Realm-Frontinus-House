import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBipTables1693557651878 implements MigrationInterface {
    name = 'AddBipTables1693557651878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bip_vote" ("id" SERIAL NOT NULL, "direction" integer NOT NULL DEFAULT '1', "address" character varying NOT NULL, "bipOptionId" integer NOT NULL, "bipRoundId" integer NOT NULL, "weight" integer NOT NULL DEFAULT '0', "actualWeight" integer NOT NULL DEFAULT '0', "blockHeight" integer, "delegateId" integer, "delegateAddress" character varying, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "deletedDate" TIMESTAMP, CONSTRAINT "PK_f318d813b42faf6906a1f8127b9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bip_option" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "description" text NOT NULL, "optionType" integer NOT NULL, "bipRoundId" integer NOT NULL, "voteCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "deletedAt" TIMESTAMP, CONSTRAINT "PK_6789585fbdb7b1cdaa9fab2b6c4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "bip_round" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "address" character varying NOT NULL DEFAULT '', "title" character varying NOT NULL, "content" character varying, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "optionCount" integer NOT NULL DEFAULT '0', "voteCount" integer NOT NULL DEFAULT '0', "commentCount" integer NOT NULL DEFAULT '0', "previewImage" character varying, "createdDate" TIMESTAMP NOT NULL DEFAULT now(), "lastUpdatedDate" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "balanceBlockTag" integer NOT NULL DEFAULT '0', "visibleStatus" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_3035f713fd75e3b38b40d4e424e" PRIMARY KEY ("id")); COMMENT ON COLUMN "bip_round"."visibleStatus" IS '0 means pending, 1 means normal'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "bip_round"`);
        await queryRunner.query(`DROP TABLE "bip_option"`);
        await queryRunner.query(`DROP TABLE "bip_vote"`);
    }

}
