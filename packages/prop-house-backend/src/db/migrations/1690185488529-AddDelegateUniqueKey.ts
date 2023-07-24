import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDelegateUniqueKey1690185488529 implements MigrationInterface {
    name = 'AddDelegateUniqueKey1690185488529';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `alter table delegate
            add constraint delegate_unique_pk
                unique ("delegationId", "applicationId", "fromAddress", "toAddress");
        `,
          );        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }
}
