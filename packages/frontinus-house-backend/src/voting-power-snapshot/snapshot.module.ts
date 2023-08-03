import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snapshot } from './snapshot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Snapshot])],
  exports: [TypeOrmModule],
})
export class SnapshotModule {}
