import {MigrationInterface, QueryRunner} from "typeorm";

// round（auction） => proposal => vote
// delegation => application => delegate
export class AddDelegation1689737934573 implements MigrationInterface {
  name = 'AddDelegation1689737934573';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "delegation" (
                "id" SERIAL NOT NULL, 
                "visible" boolean NOT NULL DEFAULT true, 
                "title" character varying NOT NULL, 
                "description" character varying, 
                "applicationCount" integer NOT NULL DEFAULT '0',
                "startTime" TIMESTAMP NOT NULL, 
                "proposalEndTime" TIMESTAMP NOT NULL, 
                "votingEndTime" TIMESTAMP NOT NULL, 
                "endTime" TIMESTAMP NOT NULL, 
                "createdDate" TIMESTAMP NOT NULL, 
                "lastUpdatedDate" TIMESTAMP, 
                CONSTRAINT "PK_zxoui2qerfs12af87asfwiuar" PRIMARY KEY ("id"))`,
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "delegation"`);
    }

}
