import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { EIP1271SignatureValidationTaskService } from './tasks';
import { VotesService } from 'src/vote/votes.service';
import { Vote } from 'src/vote/vote.entity';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { Delegation } from '../delegation/delegation.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      Proposal,
      Vote,
      Auction,
      Community,
      Delegate,
      Delegation,
    ]),
  ],
  providers: [
    ProposalsService,
    VotesService,
    AuctionsService,
    EIP1271SignatureValidationTaskService,
    BlockchainService,
    DelegationService,
    DelegateService,
  ],
})
export class TasksModule {}
