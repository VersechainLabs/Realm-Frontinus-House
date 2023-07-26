import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from 'src/auction/auction.entity';
import { AuctionsService } from 'src/auction/auctions.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Vote } from './vote.entity';
import { VotesController } from './votes.controller';
import { VotesService } from './votes.service';
import { Community } from 'src/community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { Delegation } from '../delegation/delegation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vote,
      Proposal,
      Auction,
      Community,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [VotesController],
  providers: [
    VotesService,
    ProposalsService,
    AuctionsService,
    BlockchainService,
    DelegationService,
    DelegateService,
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
