import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { IpfsModule } from '../ipfs/ipfs.module';
import { IpfsService } from '../ipfs/ipfs.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from './file.entity';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule.forRoot(), TypeOrmModule.forFeature([File])],
  providers: [FileService, IpfsService, S3Service],
  controllers: [FileController],
})
export class FileModule {}
