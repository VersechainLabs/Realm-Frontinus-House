import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { CommunitiesService } from '../community/community.service';
import { Proposal } from '../proposal/proposal.entity';
import { ProposalsService } from '../proposal/proposals.service';
import { Auction } from '../auction/auction.entity';
import { Delegation } from '../delegation/delegation.entity';
import { ApplicationService } from '../delegation-application/application.service';
import { Application } from '../delegation-application/application.entity';
import { Delegate } from '../delegate/delegate.entity';
import { BipOption } from 'src/bip-option/bip-option.entity';
import { BipRound } from 'src/bip-round/bip-round.entity';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import { SnapshotModule } from 'src/voting-power-snapshot/snapshot.module';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { HttpModule } from '@nestjs/axios';
import { AxiosService } from './axios.service';

@Module({
  imports: [
    HttpModule,
  ],
  // controllers: [BipCommentsController],
  providers: [
    // BipCommentsService,
    // BipRoundService,
    // BipOptionService,
    // BlockchainService,
    AxiosService,
  ],
  // exports: [TypeOrmModule],
})
export class AxiosModule {}
