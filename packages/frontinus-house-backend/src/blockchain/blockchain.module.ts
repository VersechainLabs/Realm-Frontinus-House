import { BullModule } from '@nestjs/bull';
import { BchainProcessor } from './blockchain.processor';
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Application } from '../delegation-application/application.entity';
import { BlockchainController } from './blockchain.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Snapshot, Delegate, Delegation, Application]),
    BullModule.registerQueue({
      name: 'bchain',
    }),
  ],
  controllers: [BlockchainController],
  providers: [
    BlockchainService,
    DelegationService,
    BchainProcessor,
    // ApplicationService,
  ],
})
export class BlockchainModule {}
