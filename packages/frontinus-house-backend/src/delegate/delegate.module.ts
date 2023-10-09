import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Delegate } from './delegate.entity';
import { Delegation } from '../delegation/delegation.entity';
import { DelegateController } from './delegate.controller';
import { DelegateService } from './delegate.service';
import { Application } from '../delegation-application/application.entity';
import { ApplicationService } from '../delegation-application/application.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Community } from '../community/community.entity';
import { DelegationService } from 'src/delegation/delegation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Delegate,
      Delegation,
      Application,
      Snapshot,
      Community,
    ]),
  ],
  controllers: [DelegateController],
  providers: [DelegationService, DelegateService, ApplicationService, BlockchainService],
  exports: [TypeOrmModule],
})
export class DelegateModule {}
