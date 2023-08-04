import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delegate } from './delegate.entity';

export type AuctionWithProposalCount = Delegate & { numProposals: number };

@Injectable()
export class DelegateService {
  constructor(
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
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

  async remove(id: number): Promise<void> {
    await this.delegateRepository.softDelete(id);
  }

  findByFromAddress(
    delegationId: number,
    fromAddress: string,
  ): Promise<Delegate> {
    return this.delegateRepository.findOne({
      where: { delegationId, fromAddress },
    });
  }

  checkDelegateExist(
    applicationId: number,
    fromAddress: string,
  ): Promise<Delegate> {
    return this.delegateRepository.findOne({
      where: { applicationId, fromAddress },
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

  getDelegateListByApplicationId(applicationId: number): Promise<Delegate[]> {
    return this.delegateRepository.find({
      where: { applicationId },
    });
  }

  async store(proposal: Delegate): Promise<Delegate> {
    return await this.delegateRepository.save(proposal, { reload: true });
  }
}
