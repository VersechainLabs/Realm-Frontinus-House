import {MigrationInterface, QueryRunner} from "typeorm";

export class AddVoteCountForProposal1688629587174 implements MigrationInterface {
    name = 'AddVoteCountForProposal1688629587174';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `ALTER TABLE "proposal" ADD "voteCount" integer NOT NULL DEFAULT '0'`,
      );
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(
        `ALTER TABLE "proposal" DROP COLUMN "voteCount"`,
      );
    }
}
