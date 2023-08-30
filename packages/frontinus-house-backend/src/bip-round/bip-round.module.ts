import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { BipRound } from './bip-round.entity';
import { BipRoundController } from './bip-round.controller';
import { BipRoundService } from './bip-round.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationService } from '../delegation/delegation.service';
import { Delegation } from '../delegation/delegation.entity';
import { AdminService } from '../admin/admin.service';
import { Admin } from '../admin/admin.entity';
import { BipService } from 'src/bip-option/bip-option.service';
import { BipOptionModule } from 'src/bip-option/bip-option.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Admin,
      BipRound,
      Proposal,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
    BipOptionModule,
  ],
  controllers: [BipRoundController],
  providers: [
    BipRoundService,
    BipService,
    AdminService,
    BlockchainService,
    DelegateService,
    DelegationService,
  ],
  exports: [TypeOrmModule],
})
export class BipRoundModule {}
