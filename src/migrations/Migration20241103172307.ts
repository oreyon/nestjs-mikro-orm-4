import { Migration } from '@mikro-orm/migrations';

export class Migration20241103172307 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`users\` modify \`role\` enum('USER', 'ADMIN') not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`users\` modify \`role\` enum('USER', 'ADMIN') not null default 'USER';`);
  }

}
