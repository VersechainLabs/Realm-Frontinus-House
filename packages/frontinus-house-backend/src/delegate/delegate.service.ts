import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Delegate } from './delegate.entity';


// export enum DelegateErrorTypes {
//   OK,
//   NO_APPLICATION,
//   NOT_VOTING,
//   VOTED,
//   OCCUPIED,
//   NO_POWER
// }

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

  findOneBy(opt?: FindOneOptions<Delegate>): Promise<Delegate> {
    return this.delegateRepository.findOne(opt);
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

  // For 6v's internal use, to generate Excel:
  searchDelegateList(delegationId?: number, applicationId?: number): Promise<Delegate[]> {
    if (delegationId && applicationId) {
      return this.delegateRepository.find({
        where: { delegationId, applicationId },
      });
    }

    if (delegationId) {
      return this.delegateRepository.find({
        where: { delegationId },
      });
    }

    if (applicationId) {
      return this.delegateRepository.find({
        where: { applicationId },
      });
    }

    // if no id is passed, then return all:
    return this.delegateRepository.find({
    });
  }

  async store(proposal: Delegate): Promise<Delegate> {
    return await this.delegateRepository.save(proposal, { reload: true });
  }


}
