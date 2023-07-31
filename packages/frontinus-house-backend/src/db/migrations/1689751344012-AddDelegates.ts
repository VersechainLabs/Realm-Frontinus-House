import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelegates1689751344012 implements MigrationInterface {
    name = 'AddDelegates1689751344012';

    // Notice: signedData is a jsonb, not string! 
    // When pass in param, it's using Buffer.from()
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "delegate" ( 
                "id" SERIAL NOT NULL, 
                "delegationId" integer NOT NULL, 
                "applicationId" integer NOT NULL, 
                "fromAddress" character varying NOT NULL, 
                "toAddress" character varying NOT NULL, 
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_80zsdioufQasdf1219iazuauo99" PRIMARY KEY ("id"))`,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delegate"`);
    }
}
