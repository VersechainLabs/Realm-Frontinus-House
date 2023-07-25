import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelegateUniqueKey1690267970277 implements MigrationInterface {
    name = 'AddDelegateUniqueKey1690267970277';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `alter table delegate
            add constraint delegate_unique_pk
                unique ("delegationId", "fromAddress");
        `,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
