import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class CreateOrderTables1750949650948 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create orders table
        await queryRunner.createTable(new Table({
            name: "orders",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "orderNumber",
                    type: "varchar",
                    isUnique: true
                },
                {
                    name: "user_id",
                    type: "uuid",
                    isNullable: true
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "processing", "paid", "shipped", "delivered", "cancelled", "refunded"],
                    default: "'pending'"
                },
                {
                    name: "paymentStatus",
                    type: "enum",
                    enum: ["pending", "paid", "failed", "refunded"],
                    default: "'pending'"
                },
                {
                    name: "paymentMethod",
                    type: "enum",
                    enum: ["credit_card", "line_pay"],
                    isNullable: true
                },
                {
                    name: "subtotal",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "shippingFee",
                    type: "decimal",
                    precision: 10,
                    scale: 2,
                    default: 0
                },
                {
                    name: "total",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "customerInfo",
                    type: "jsonb"
                },
                {
                    name: "notes",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create order_items table
        await queryRunner.createTable(new Table({
            name: "order_items",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "order_id",
                    type: "uuid"
                },
                {
                    name: "product_id",
                    type: "uuid"
                },
                {
                    name: "variant_id",
                    type: "uuid",
                    isNullable: true
                },
                {
                    name: "quantity",
                    type: "int"
                },
                {
                    name: "price",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "specs",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create payment_records table
        await queryRunner.createTable(new Table({
            name: "payment_records",
            columns: [
                {
                    name: "id",
                    type: "uuid",
                    isPrimary: true,
                    generationStrategy: "uuid",
                    default: "uuid_generate_v4()"
                },
                {
                    name: "order_id",
                    type: "uuid"
                },
                {
                    name: "transactionId",
                    type: "varchar",
                    isNullable: true
                },
                {
                    name: "paymentMethod",
                    type: "varchar"
                },
                {
                    name: "amount",
                    type: "decimal",
                    precision: 10,
                    scale: 2
                },
                {
                    name: "status",
                    type: "enum",
                    enum: ["pending", "success", "failed", "refunded"],
                    default: "'pending'"
                },
                {
                    name: "requestData",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "responseData",
                    type: "jsonb",
                    isNullable: true
                },
                {
                    name: "errorMessage",
                    type: "text",
                    isNullable: true
                },
                {
                    name: "createdAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                },
                {
                    name: "updatedAt",
                    type: "timestamp",
                    default: "CURRENT_TIMESTAMP"
                }
            ]
        }), true);

        // Create foreign keys
        await queryRunner.createForeignKey("orders", new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "users",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("order_items", new TableForeignKey({
            columnNames: ["order_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "orders",
            onDelete: "CASCADE"
        }));

        await queryRunner.createForeignKey("order_items", new TableForeignKey({
            columnNames: ["product_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "products",
            onDelete: "RESTRICT"
        }));

        await queryRunner.createForeignKey("order_items", new TableForeignKey({
            columnNames: ["variant_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "product_variants",
            onDelete: "SET NULL"
        }));

        await queryRunner.createForeignKey("payment_records", new TableForeignKey({
            columnNames: ["order_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "orders",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const orderItemsTable = await queryRunner.getTable("order_items");
        const paymentRecordsTable = await queryRunner.getTable("payment_records");
        const ordersTable = await queryRunner.getTable("orders");

        if (paymentRecordsTable) {
            const foreignKeys = paymentRecordsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("payment_records", foreignKey);
            }
        }

        if (orderItemsTable) {
            const foreignKeys = orderItemsTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("order_items", foreignKey);
            }
        }

        if (ordersTable) {
            const foreignKeys = ordersTable.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey("orders", foreignKey);
            }
        }

        // Drop tables
        await queryRunner.dropTable("payment_records");
        await queryRunner.dropTable("order_items");
        await queryRunner.dropTable("orders");
    }

}