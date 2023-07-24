import {MigrationInterface, QueryRunner} from "typeorm";

export class AddActualWeightForVote1690183175542 implements MigrationInterface {
    name = 'AddActualWeightForVote1690183175542'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" ADD "actualWeight" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD "weight" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "vote" ADD CONSTRAINT "FK_ce5bbe0a1aafdd22337f2aa7525" FOREIGN KEY ("delegateId") REFERENCES "delegate"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote" DROP CONSTRAINT "FK_ce5bbe0a1aafdd22337f2aa7525"`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "weight"`);
        await queryRunner.query(`ALTER TABLE "vote" ADD "weight" numeric NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "vote" DROP COLUMN "actualWeight"`);
    }

}
