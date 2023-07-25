import {MigrationInterface, QueryRunner} from "typeorm";

export class AddSnapshotUniqueKey1690278373874 implements MigrationInterface {
    name = 'AddSnapshotUniqueKey1690278373874';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `alter table snapshot
            add constraint snapshot_unique_pk
                unique ("blockNum", "address");
        `,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
