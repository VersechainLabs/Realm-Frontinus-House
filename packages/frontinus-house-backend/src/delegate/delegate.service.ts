import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delegate } from './delegate.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { CreateDelegateDto } from './delegate.types';

export type AuctionWithProposalCount = Delegate & { numProposals: number };

@Injectable()
export class DelegateService {
  constructor(
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
  ) {}

  findAll(): Promise<Delegate[]> {
    return this.delegateRepository.find({
      // loadRelationIds: {
      //   relations: ['proposals.auction', 'community'],
      // },
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<Delegate> {
    return this.delegateRepository.findOne(id, {
      // relations: ['proposals'],
      // loadRelationIds: {
      //   relations: ['community'],
      // },
      //   where: { visible: true },
    });
  }

  findByFromAddress(
    delegationId: number,
    fromAddress: string,
  ): Promise<Delegate> {
    return this.delegateRepository.findOne({
      where: { delegationId, fromAddress },
    });
  }

  getDelegateListByAddress(
    delegationId: number,
    toAddress: string,
  ): Promise<Delegate[]> {
    return this.delegateRepository.find({
      where: { delegationId, toAddress },
    });
  }

  async store(proposal: Delegate): Promise<Delegate> {
    return await this.delegateRepository.save(proposal, { reload: true });
  }

  findByDelegationId(delegationId: number): Promise<Delegate[]> {
    const delegateList = this.delegateRepository.find({
      where: { delegationId: delegationId },
    });

    return delegateList;
  }
}
