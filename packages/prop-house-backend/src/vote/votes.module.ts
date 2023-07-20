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

@Module({
  imports: [
    TypeOrmModule.forFeature([Vote, Proposal, Auction, Community]),
  ],
  controllers: [VotesController],
  providers: [
    VotesService,
    ProposalsService,
    AuctionsService,
  ],
  exports: [TypeOrmModule],
})
export class VotesModule {}
