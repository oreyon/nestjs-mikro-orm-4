import { Migration } from '@mikro-orm/migrations';

export class Migration20241210161208 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`users\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(100) not null, \`username\` varchar(100) not null, \`password\` varchar(100) not null, \`role\` enum('USER', 'ADMIN') not null, \`refresh_token\` varchar(255) null, \`is_verified\` tinyint(1) not null default false, \`verified_time\` timestamp null, \`email_verification_token\` varchar(255) null, \`password_reset_token\` varchar(255) null, \`password_reset_token_expiration_time\` timestamp null, \`created_at\` timestamp not null, \`updated_at\` timestamp not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`users\` add unique \`users_email_unique\`(\`email\`);`);
    this.addSql(`alter table \`users\` add unique \`users_username_unique\`(\`username\`);`);

    this.addSql(`create table \`contacts\` (\`id\` int unsigned not null auto_increment primary key, \`first_name\` varchar(100) not null, \`last_name\` varchar(100) null, \`email\` varchar(100) null, \`phone\` varchar(20) null, \`user_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`contacts\` add index \`contacts_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`addresses\` (\`id\` int unsigned not null auto_increment primary key, \`street\` varchar(255) null, \`city\` varchar(100) null, \`province\` varchar(100) null, \`country\` varchar(100) not null, \`postal_code\` varchar(10) null, \`contact_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`addresses\` add index \`addresses_contact_id_index\`(\`contact_id\`);`);

    this.addSql(`alter table \`contacts\` add constraint \`contacts_user_id_foreign\` foreign key (\`user_id\`) references \`users\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`addresses\` add constraint \`addresses_contact_id_foreign\` foreign key (\`contact_id\`) references \`contacts\` (\`id\`) on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`contacts\` drop foreign key \`contacts_user_id_foreign\`;`);

    this.addSql(`alter table \`addresses\` drop foreign key \`addresses_contact_id_foreign\`;`);

    this.addSql(`drop table if exists \`users\`;`);

    this.addSql(`drop table if exists \`contacts\`;`);

    this.addSql(`drop table if exists \`addresses\`;`);
  }

}
