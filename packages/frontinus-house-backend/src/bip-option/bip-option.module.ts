import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auction } from '../auction/auction.entity';
import { AuctionsService } from '../auction/auctions.service';
import { Vote } from '../vote/vote.entity';
import { BipOption } from './bip-option.entity';
import { BipOptionController } from './bip-option.controller';
import { BipService } from './bip-option.service';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Snapshot } from '../voting-power-snapshot/snapshot.entity';
import { Delegation } from '../delegation/delegation.entity';
import { Delegate } from '../delegate/delegate.entity';
import { DelegateService } from '../delegate/delegate.service';
import { DelegationService } from '../delegation/delegation.service';
import { VotesService } from '../vote/votes.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BipOption,
      Vote,
      Auction,
      Community,
      Snapshot,
      Delegate,
      Delegation,
    ]),
  ],
  controllers: [BipOptionController],
  providers: [
    BipService,
    AuctionsService,
    BlockchainService,
    VotesService,
  ],
  exports: [TypeOrmModule],
})
export class BipOptionModule {}
