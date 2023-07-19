import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAdmin1689237050922 implements MigrationInterface {

    name = 'AddAdmin1689237050922';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "admin" (
                "id" SERIAL NOT NULL, 
                "address" character varying NOT NULL, 
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_12987zsiudaiure123PKASAASF034" PRIMARY KEY ("id"))`,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin"`);

    }
}
