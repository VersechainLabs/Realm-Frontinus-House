import {MigrationInterface, QueryRunner} from "typeorm";

export class addAddressForAuctionAndDelegation1692349948035 implements MigrationInterface {
    name = 'addAddressForAuctionAndDelegation1692349948035'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "auction" ADD "address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "delegation" ADD "address" character varying NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "delegation" ADD "deletedDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "createdDate" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "lastUpdatedDate" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "lastUpdatedDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delegation" ALTER COLUMN "createdDate" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "deletedDate"`);
        await queryRunner.query(`ALTER TABLE "delegation" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "auction" DROP COLUMN "address"`);
    }

}
