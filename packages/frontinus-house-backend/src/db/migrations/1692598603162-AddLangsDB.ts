import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLangsDB1692598603162 implements MigrationInterface {
    name = 'AddLangsDB1692598603162'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "langs" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_e0bb7dc43457e44d0123fb3e52f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "deletedDate"`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "lastUpdatedDate" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "lastUpdatedDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "createdDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "delegation" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "delegation" ADD "address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "auction" ADD "address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`DROP TABLE "langs"`);
    }

}
