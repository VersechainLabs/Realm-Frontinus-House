import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration from './config/configuration';
import { PostgresDatabaseProviderModule } from './db/postgres.provider';
import { IpfsModule } from './ipfs/ipfs.module';
import { FileModule } from './file/file.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
    }),
    CacheModule.register({
      store: 'memory',
      isGlobal: true,
      max: 500,
      ttl: 300 * 1000, // 5 minutes
    }),
    PostgresDatabaseProviderModule,
    IpfsModule,
    FileModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    // BlockchainModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
