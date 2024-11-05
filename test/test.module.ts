import { Module } from '@nestjs/common';
import { TestService } from './test.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TestService],
  exports: [],
})
export class TestModule {}
