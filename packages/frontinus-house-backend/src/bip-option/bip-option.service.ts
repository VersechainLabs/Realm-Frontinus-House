import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { BipOption } from './bip-option.entity';
import { GetBipOptionsDto } from './bip-option.types';

@Injectable()
export class BipOptionService {
  constructor(
    @InjectRepository(BipOption)
    private bipOptionRepository: Repository<BipOption>,
  ) {}

  findBy(options: FindOneOptions<BipOption>): Promise<BipOption> {
    return this.bipOptionRepository.findOne(options);
  }
  
  findAll(dto: GetBipOptionsDto) {
    return this.bipOptionRepository.find({
      skip: dto.skip,
      take: dto.limit,
      order: {
        createdDate: dto.order,
      },
      // loadRelationIds: {
      //   relations: ['votes'],
      // },
      where: { visible: true },
    });
  }

  async findAllWithBipRoundId(bipRoundId: number) {
    return await this.bipOptionRepository.find({
      // relations: ['votes'],
      where: { bipRoundId: bipRoundId },
    });
  }

  async findOne(id: number) {
    const proposal = await this.bipOptionRepository.findOne(id, {
      relations: ['bipVotes', 'bipRound'],
    });

    if (!proposal || !proposal.bipRound) {
      return null;
    }
    proposal.bipRoundId = proposal.bipRound.id;
    return proposal;
  }

  findBetween(start: Date = new Date('1900-01-01'), end: Date) {
    return this.bipOptionRepository
      .createQueryBuilder('proposal')
      .where('proposal.createdDate > :start', { start: start.toISOString() })
      .andWhere('proposal.createdDate <= :end', {
        end: (end ?? new Date()).toISOString(),
      })
      .getMany();
  }

  async remove(id: number): Promise<void> {
    await this.bipOptionRepository.delete(id);
  }

  async rollupVoteCount(id: number) {
    const foundProposal = await this.findOne(id);
    if (!foundProposal) return;
    foundProposal.updateVoteCount();

    await this.bipOptionRepository.save(foundProposal);
  }

  async store(bipOption: BipOption) {
    return await this.bipOptionRepository.save(bipOption);
  }

  async decrVoteCount(id:number,weight:number){
    return await this.bipOptionRepository.decrement({id:id},'voteCount',weight);
  }

}
