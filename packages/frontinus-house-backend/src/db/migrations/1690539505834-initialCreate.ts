import {MigrationInterface, QueryRunner} from "typeorm";

export class initialCreate1690539505834 implements MigrationInterface {
    name = 'initialCreate1690539505834'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "delegation" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "description" character varying, "applicationCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "startTime" TIMESTAMP NOT NULL, "proposalEndTime" TIMESTAMP NOT NULL, "votingEndTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_a2cb6c9b942d68b109131beab44" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "application" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "address" character varying NOT NULL, "title" character varying NOT NULL, "tldr" character varying NOT NULL, "description" character varying, "delegationId" integer NOT NULL, "delegatorCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "deletedAt" TIMESTAMP, CONSTRAINT "PK_569e0c3e863ebdf5f2408ee1670" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "delegate" ("id" SERIAL NOT NULL, "delegationId" integer NOT NULL, "applicationId" integer NOT NULL, "fromAddress" character varying NOT NULL, "toAddress" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_810516365b3daa9f6d6d2d4f2b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "vote" ("id" SERIAL NOT NULL, "direction" integer NOT NULL DEFAULT '1', "address" character varying NOT NULL, "proposalId" integer NOT NULL, "auctionId" integer NOT NULL, "weight" integer NOT NULL DEFAULT '0', "actualWeight" integer NOT NULL DEFAULT '0', "blockHeight" integer, "delegateId" integer, "delegateAddress" character varying, "createdDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "proposal" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "what" text NOT NULL, "tldr" text NOT NULL, "auctionId" integer NOT NULL, "address" character varying NOT NULL, "voteCount" integer NOT NULL DEFAULT '0', "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "deletedAt" TIMESTAMP, "reqAmount" numeric, "parentType" character varying NOT NULL DEFAULT 'auction', CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auction" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "startTime" TIMESTAMP NOT NULL, "proposalEndTime" TIMESTAMP NOT NULL, "votingEndTime" TIMESTAMP NOT NULL, "fundingAmount" numeric(10,2) NOT NULL DEFAULT '0', "currencyType" character varying, "description" character varying, "numWinners" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, "balanceBlockTag" integer NOT NULL DEFAULT '0', "communityId" integer, CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "community" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "contractAddress" character varying NOT NULL, "name" character varying NOT NULL, "profileImageUrl" character varying NOT NULL, "description" character varying, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "admin" ("id" SERIAL NOT NULL, "address" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comment" ("id" SERIAL NOT NULL, "visible" boolean NOT NULL DEFAULT true, "content" character varying NOT NULL, "owner" character varying NOT NULL, "proposalId" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_0b0e4bbc8415ec426f87f3a88e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "file" ("id" SERIAL NOT NULL, "hidden" boolean NOT NULL DEFAULT false, "address" character varying, "name" character varying NOT NULL, "mimeType" character varying NOT NULL, "ipfsHash" character varying NOT NULL, "pinSize" integer NOT NULL, "ipfsTimestamp" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "snapshot" ("id" SERIAL NOT NULL, "communityAddress" character varying NOT NULL, "blockNum" integer NOT NULL, "address" character varying NOT NULL, "votingPower" integer NOT NULL, "createdDate" TIMESTAMP NOT NULL, CONSTRAINT "PK_47b29c1a6055220b1ebdafdf7b5" PRIMARY KEY ("id")); COMMENT ON COLUMN "snapshot"."communityAddress" IS 'communityAddress in communities, used to confirm the voting power strategy'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "snapshot"`);
        await queryRunner.query(`DROP TABLE "file"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "admin"`);
        await queryRunner.query(`DROP TABLE "community"`);
        await queryRunner.query(`DROP TABLE "auction"`);
        await queryRunner.query(`DROP TABLE "proposal"`);
        await queryRunner.query(`DROP TABLE "vote"`);
        await queryRunner.query(`DROP TABLE "delegate"`);
        await queryRunner.query(`DROP TABLE "application"`);
        await queryRunner.query(`DROP TABLE "delegation"`);
    }

}
