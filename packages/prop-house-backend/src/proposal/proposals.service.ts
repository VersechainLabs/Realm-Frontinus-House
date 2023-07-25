import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Proposal } from './proposal.entity';
import { GetProposalsDto } from './proposal.types';
import { convertVoteListToDelegateVoteList } from '../vote/vote.entity';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
  ) {}

  findAll(dto: GetProposalsDto) {
    return this.proposalsRepository.find({
      skip: dto.skip,
      take: dto.limit,
      order: {
        createdDate: dto.order,
      },
      loadRelationIds: {
        relations: ['votes'],
      },
      where: { visible: true },
    });
  }

  findAllWithAuctionId(auctionId: number) {
    return this.proposalsRepository.find({
      relations: ['votes'],
      where: { visible: true, auctionId: auctionId },
    });
  }

  async findOne(id: number) {
    const proposal = await this.proposalsRepository.findOne(id, {
      relations: ['votes', 'auction'],
      where: { visible: true },
    });

    if (!proposal.auction) {
      return null;
    }
    proposal.auctionId = proposal.auction.id;
    return proposal;
  }

  findBetween(start: Date = new Date('1900-01-01'), end: Date) {
    return this.proposalsRepository
      .createQueryBuilder('proposal')
      .where('proposal.createdDate > :start', { start: start.toISOString() })
      .andWhere('proposal.createdDate <= :end', {
        end: (end ?? new Date()).toISOString(),
      })
      .getMany();
  }

  async remove(id: number): Promise<void> {
    await this.proposalsRepository.delete(id);
  }

  async rollupVoteCount(id: number) {
    const foundProposal = await this.findOne(id);
    if (!foundProposal) return;
    foundProposal.updateVoteCount();
    this.proposalsRepository.save(foundProposal);
  }

  async store(proposal: Proposal) {
    return await this.proposalsRepository.save(proposal);
  }

  async voteCountById(id: number): Promise<number> {
    const foundProposal = await this.proposalsRepository.findOneOrFail(id);
    return foundProposal.voteCount;
  }
}
