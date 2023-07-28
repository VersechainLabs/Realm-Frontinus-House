import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BlockchainService } from './blockchain.service';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [BlockchainService, SnapshotService],
})
export class BlockchainModule {}
