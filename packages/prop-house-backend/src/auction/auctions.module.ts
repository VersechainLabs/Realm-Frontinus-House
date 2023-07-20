import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Community } from 'src/community/community.entity';
import { CommunitiesService } from 'src/community/community.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Auction } from './auction.entity';
import { AuctionsResolver } from './auction.resolver';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { BlockchainService } from '../blockchain/blockchain.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Proposal, Community])],
  controllers: [AuctionsController],
  providers: [
    AuctionsService,
    ProposalsService,
    AuctionsResolver,
    CommunitiesService,
    BlockchainService,
  ],
  exports: [TypeOrmModule],
})
export class AuctionsModule {}
