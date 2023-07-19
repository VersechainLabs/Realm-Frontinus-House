import {MigrationInterface, QueryRunner} from "typeorm";

export class AddApplicationForDelegation1689738094662 implements MigrationInterface {
    name = 'AddApplicationForDelegation1689738094662';

    // Notice: signedData is a jsonb, not string! 
    // When pass in param, it's using Buffer.from()
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "application" ( 
                "id" SERIAL NOT NULL, 
                "visible" boolean NOT NULL DEFAULT true,
                "address" character varying NOT NULL, 
                "title" character varying NOT NULL, 
                "tldr" text NOT NULL, 
                "description" text NOT NULL, 
                "delegationId" integer NOT NULL, 
                "delegatorCount" integer NOT NULL DEFAULT '0',
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                "deletedAt" TIMESTAMP,
                CONSTRAINT "PK_asdofu1279zdnluwer10aeqwe31123a" PRIMARY KEY ("id"))`,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "application"`);
    }
}
