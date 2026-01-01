import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddPurchasesCount1735747200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if column already exists
    const table = await queryRunner.getTable('specialists');
    const purchasesCountColumn = table?.findColumnByName('purchases_count');

    if (!purchasesCountColumn) {
      await queryRunner.addColumn(
        'specialists',
        new TableColumn({
          name: 'purchases_count',
          type: 'int',
          default: 0,
          isNullable: false,
        })
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('specialists');
    const purchasesCountColumn = table?.findColumnByName('purchases_count');

    if (purchasesCountColumn) {
      await queryRunner.dropColumn('specialists', 'purchases_count');
    }
  }
}

