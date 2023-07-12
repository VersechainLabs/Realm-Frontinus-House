import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelegates1688713778584 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "delegate" (
                "id" SERIAL NOT NULL, 
                "visible" boolean NOT NULL DEFAULT true, 
                "title" character varying NOT NULL, 
                "description" character varying, 
                "nomineeCount" integer NOT NULL DEFAULT '0',
                "startTime" TIMESTAMP NOT NULL, 
                "proposalEndTime" TIMESTAMP NOT NULL, 
                "votingEndTime" TIMESTAMP NOT NULL, 
                "endTime" TIMESTAMP NOT NULL, 
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_zxoui231asdfs12287asfwiuar" PRIMARY KEY ("id"))`,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delegate"`);
    }

}
