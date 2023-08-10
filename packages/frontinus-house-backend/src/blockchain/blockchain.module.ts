import { BullModule } from '@nestjs/bull';
import { BchainProcessor } from './blockchain.processor';
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Snapshot]),
    BullModule.registerQueue({
      name: 'bchain',
    }),
  ],
  controllers: [BlockchainController],
  providers: [BlockchainService, BchainProcessor],
})
export class BlockchainModule {}
