import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThan, Repository } from 'typeorm';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto, DelegationState } from './delegation.types';

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}

  findAll(): Promise<Delegation[]> {
    return this.delegationRepository.find({
      loadRelationIds: {
        relations: ['applications'],
      },
      where: {
        visible: true,
      },
      order: {
        id: 'DESC',
      },
    });
  }

  findOne(id: number): Promise<Delegation> {
    return this.delegationRepository.findOne(id, {
      relations: ['applications'],
      // loadRelationIds: {
      //   relations: ['community'],
      // },
      where: { visible: true },
    });
  }

  async store(proposal: Delegation): Promise<Delegation> {
    return await this.delegationRepository.save(proposal, { reload: true });
  }

  async remove(id: number): Promise<void> {
    await this.delegationRepository.delete(id);
  }

  async getState(id: number, currentTime?: Date): Promise<DelegationState> {
    const delegation = this.delegationRepository.findOne(id, {
      where: { visible: true },
    });

    if (currentTime === undefined) {
      currentTime = new Date();
    }

    if (currentTime < (await delegation).startTime) {
      return DelegationState.NOT_START;
    } else if (currentTime < (await delegation).proposalEndTime) {
      return DelegationState.APPLYING;
    } else if (currentTime < (await delegation).votingEndTime) {
      return DelegationState.DELEGATING;
    } else if (currentTime < (await delegation).endTime) {
      return DelegationState.ACTIVE;
    } else {
      return DelegationState.EXPIRED;
    }
  }

  getConflictDelegateByTimeRange(
    dto: CreateDelegationDto,
  ): Promise<Delegation[]> {
    return this.delegationRepository.find({
      where: [
        {
          visible: true,
          votingEndTime: Between(dto.votingEndTime, dto.endTime),
        },
        {
          visible: true,
          endTime: Between(dto.votingEndTime, dto.endTime),
        },
      ],
    });
  }

  async findByState(
    stateToFind: DelegationState,
    timeToFind?: Date,
  ): Promise<Delegation[]> {
    if (timeToFind === undefined) {
      timeToFind = new Date();
    }

    if (stateToFind == DelegationState.NOT_START) {
      return this.delegationRepository.find({
        where: {
          visible: true,
          startTime: MoreThan(timeToFind),
        },
      });
    } else if (stateToFind == DelegationState.APPLYING) {
      return this.delegationRepository.find({
        where: {
          visible: true,
          startTime: LessThanOrEqual(timeToFind),
          proposalEndTime: MoreThan(timeToFind),
        },
      });
    } else if (stateToFind == DelegationState.DELEGATING) {
      return this.delegationRepository.find({
        where: {
          visible: true,
          proposalEndTime: LessThanOrEqual(timeToFind),
          votingEndTime: MoreThan(timeToFind),
        },
      });
    } else if (stateToFind == DelegationState.ACTIVE) {
      return this.delegationRepository.find({
        where: {
          visible: true,
          votingEndTime: LessThanOrEqual(timeToFind),
          endTime: MoreThan(timeToFind),
        },
      });
    } else if (stateToFind == DelegationState.EXPIRED) {
      return this.delegationRepository.find({
        where: {
          visible: true,
          endTime: LessThanOrEqual(timeToFind),
        },
      });
    }
  }
}
