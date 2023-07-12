import {MigrationInterface, QueryRunner} from "typeorm";

export class AddComment1689144389600 implements MigrationInterface {
    name = 'AddComment1689144389600';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "comment" (
                "id" SERIAL NOT NULL, 
                "visible" boolean NOT NULL DEFAULT true,
                "address" character varying NOT NULL, 
                "signedData" jsonb NOT NULL, 
                "signatureState" character varying(60) NOT NULL DEFAULT 'VALIDATED', 
                "content" character varying NOT NULL, 
                "proposalId" integer NOT NULL,  
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_917eq2zdpao129uds123adf" PRIMARY KEY ("id"))`,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "comment"`);

    }
}
