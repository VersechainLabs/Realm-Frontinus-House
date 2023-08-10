import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Application } from './application.entity';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';
import { Delegate } from '../delegate/delegate.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Community } from '../community/community.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delegation,
      Application,
      Delegate,
      Snapshot,
      Community,
    ]),
  ],
  controllers: [ApplicationController],
  providers: [
    ApplicationService,
    BlockchainService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class ApplicationModule {}
