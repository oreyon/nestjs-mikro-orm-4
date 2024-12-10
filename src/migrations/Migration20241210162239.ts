import { Migration } from '@mikro-orm/migrations';

export class Migration20241210162239 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`users\` modify \`verified_time\` bigint, modify \`password_reset_token_expiration_time\` bigint, modify \`created_at\` bigint not null, modify \`updated_at\` bigint not null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`users\` modify \`verified_time\` timestamp, modify \`password_reset_token_expiration_time\` timestamp, modify \`created_at\` timestamp not null, modify \`updated_at\` timestamp not null;`);
  }

}
