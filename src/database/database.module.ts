import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Global() // it will be avaliable everywhere
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
