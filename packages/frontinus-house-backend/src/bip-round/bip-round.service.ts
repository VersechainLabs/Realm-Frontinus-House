import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from '../utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { BipRound } from './bip-round.entity';
import {
  CreateBipRoundDto,
  GetBipRoundDto,
  UpdateBipRoundDto,
} from './bip-round.types';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';
import { Delegate } from '../delegate/delegate.entity';
import { Delegation } from '../delegation/delegation.entity';
import { updateValidFields } from '../utils';

export type AuctionWithProposalCount = BipRound & { numProposals: number };

@Injectable()
export class BipRoundService {
  constructor(
    @InjectRepository(BipRound) private bipRoundRepository: Repository<BipRound>,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}

  findAll(): Promise<BipRound[]> {
    return this.bipRoundRepository.find({
      // loadRelationIds: {
      //   relations: ['bipOption.bipRound'],
      // },
      where: {
        visible: true,
      },
    });
  }

  findOne(id: number): Promise<BipRound> {
    return this.bipRoundRepository.findOne(id, {
      // relations: ['bipOption'],
      where: { visible: true },
    });
  }


  async createBipRound(dto: CreateBipRoundDto): Promise<BipRound> {
    if (
      dto.startTime >= dto.endTime
    ) {
      throw new HttpException('Time order incorrect!', HttpStatus.BAD_REQUEST);
    }

    const balanceBlockTag = await this.blockchainService.getCurrentBlockNum();

    return await this.bipRoundRepository.save({
      ...dto,
      balanceBlockTag
    });

    // newAuction.balanceBlockTag =
    //   await this.blockchainService.getCurrentBlockNum();

    // noinspection ES6MissingAwait: Just a cache, no need await
    // this.blockchainService.cacheAll(
    //   this.delegateRepository,
    //   this.delegationRepository,
    //   community.contractAddress,
    //   newAuction.balanceBlockTag,
    // );

    // return await this.bipRoundRepository.save(newAuction);
  }
}
