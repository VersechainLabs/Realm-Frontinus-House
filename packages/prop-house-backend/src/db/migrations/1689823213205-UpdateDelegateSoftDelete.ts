import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateDelegateSoftDelete1689823213205 implements MigrationInterface {

    name = 'UpdateDelegateSoftDelete1689823213205';

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "delegate" ADD "deletedAt" TIMESTAMP`);
    }
  
    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`ALTER TABLE "delegate" DROP COLUMN "deletedAt"`);
    }

}
