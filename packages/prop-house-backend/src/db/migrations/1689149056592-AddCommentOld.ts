import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCommentOld1689149056592 implements MigrationInterface {
    name = 'AddCommentOld1689149056592';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "comment" (
                "id" SERIAL NOT NULL, 
                "visible" boolean NOT NULL DEFAULT true,
                "owner" character varying NOT NULL, 
                "content" character varying NOT NULL, 
                "proposalId" integer NOT NULL,  
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_917eq1zdpao129uds123adf" PRIMARY KEY ("id"))`,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "comment"`);
    }
}
