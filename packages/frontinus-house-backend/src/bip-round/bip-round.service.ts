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
import { BipOptionService } from 'src/bip-option/bip-option.service';

export type AuctionWithProposalCount = BipRound & { numProposals: number };

@Injectable()
export class BipRoundService {
  constructor(
    @InjectRepository(BipRound) private bipRoundRepository: Repository<BipRound>,
    private readonly blockchainService: BlockchainService,
    private readonly bipOptionService: BipOptionService,
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}

  findAll(dto: GetBipRoundDto): Promise<BipRound[]> {
    return this.bipRoundRepository.find({
      // loadRelationIds: {
      //   relations: ['bipOption.bipRound'],
      // },
      where: {
        visible: true,
      },
      take: dto.limit,
      skip: dto.skip,
      order: { id: dto.order },
    });
  }

  findOne(id: number): Promise<BipRound> {
    return this.bipRoundRepository.findOne(id, {
      relations: ['bipOptions', 'bipVotes'],
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
  }


  async updateBipRoundVoteCount(bipRound: BipRound) {
    let totalCount = 0;

    for (const optionId of bipRound.bipOptionIds) {
      const option = await this.bipOptionService.findOne(optionId);

      totalCount += option.voteCount;
    }

    await this.bipRoundRepository.update(bipRound.id, {
      voteCount: totalCount
   });
  } 
}
