import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelationIdForVote1689922985757 implements MigrationInterface {
    name = 'AddDelationIdForVote1689922985757'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "delegateId" integer`);
        // await queryRunner.query(`ALTER TABLE "delegate" DROP COLUMN "deletedAt"`);
        // await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "tldr"`);
        // await queryRunner.query(`ALTER TABLE "application" ADD "tldr" character varying NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "description"`);
        // await queryRunner.query(`ALTER TABLE "application" ADD "description" character varying`);
        // await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        // await queryRunner.query(`ALTER TABLE "vote" ADD "weight" integer NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
        // await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" SET DEFAULT '0'`);
        // await queryRunner.query(`ALTER TABLE "application" ADD CONSTRAINT "FK_e6de47916b62763fc39b07e7076" FOREIGN KEY ("delegationId") REFERENCES "delegation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_ce5bbe0a1aafdd22337f2aa7525" FOREIGN KEY ("delegateId") REFERENCES "delegate"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "proposal" ADD CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f" FOREIGN KEY ("auctionId") REFERENCES "auction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        // await queryRunner.query(`ALTER TABLE "comment" ADD CONSTRAINT "FK_5611945d9fb4f5a70618458e13c" FOREIGN KEY ("proposalId") REFERENCES "proposal"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "comment" DROP CONSTRAINT "FK_5611945d9fb4f5a70618458e13c"`);
        // await queryRunner.query(`ALTER TABLE "proposal" DROP CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f"`);
        // await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_ce5bbe0a1aafdd22337f2aa7525"`);
        // await queryRunner.query(`ALTER TABLE "application" DROP CONSTRAINT "FK_e6de47916b62763fc39b07e7076"`);
        // await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" DROP DEFAULT`);
        // await queryRunner.query(`ALTER TABLE "auction" ALTER COLUMN "fundingAmount" TYPE numeric`);
        // await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        // await queryRunner.query(`ALTER TABLE "vote" ADD "weight" numeric NOT NULL DEFAULT '1'`);
        // await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "description"`);
        // await queryRunner.query(`ALTER TABLE "application" ADD "description" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "application" DROP COLUMN "tldr"`);
        // await queryRunner.query(`ALTER TABLE "application" ADD "tldr" text NOT NULL`);
        // await queryRunner.query(`ALTER TABLE "delegate" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "delegateId"`);
    }

}
