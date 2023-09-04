import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLangsDB1692602060727 implements MigrationInterface {
    name = 'AddLangsDB1692602060727'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "langs" ("id" SERIAL NOT NULL, "content" character varying NOT NULL, "createdDate" TIMESTAMP NOT NULL, "lastUpdatedDate" TIMESTAMP, CONSTRAINT "PK_e0bb7dc43457e44d0123fb3e52f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "langs"`);
    }

}
