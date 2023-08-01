import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { AudioProcessor } from './blockchain.processor';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Delegate } from '../delegate/delegate.entity';
import { DelegateService } from '../delegate/delegate.service';
import { DelegationService } from '../delegation/delegation.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Application } from '../delegation-application/application.entity';
import { ApplicationService } from '../delegation-application/application.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Snapshot, Delegate, Delegation, Application]),
    BullModule.registerQueue({
      name: 'audio',
    }),
  ],
  providers: [
    BlockchainService,
    AudioProcessor,
    DelegationService,
    ApplicationService,
  ],
})
export class BlockchainModule {}
