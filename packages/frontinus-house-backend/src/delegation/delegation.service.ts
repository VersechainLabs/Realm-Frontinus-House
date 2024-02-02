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

  findAllForCommunityByVisible(
    communityId: number,
  ): Promise<Delegation[]> {
    const where: any = {
      community: { id: communityId },
    };

    return this.delegationRepository.find({
      loadRelationIds: {
        relations: ['applications'],
      },
      where,
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

  /**
   * Delegation round's effect time (votingEndTime to endTime) can't overlap.
   * 4 cases:
   * DB:               --------------------
   * 
   * dto:
   * case 1:       ------------
   * case 2:       -------------------------------
   * case 3:               ----------
   * case 4:               -----------------------
   * 
   * 
   * @param dto 
   * @returns 
   */
  getConflictDelegateByTimeRange(
    dto: CreateDelegationDto,
  ): Promise<Delegation[]> {
  
    const communityId = dto.communityId ? dto.communityId : 1;

    return this.delegationRepository.find({
      where: [
        {
          visible: true,
          communityId: communityId,
          votingEndTime: Between(dto.votingEndTime, dto.endTime),
        },
        {
          visible: true,
          communityId: communityId,
          endTime: Between(dto.votingEndTime, dto.endTime),
        },
        {
          visible: true,
          communityId: communityId,
          votingEndTime: MoreThan(dto.votingEndTime),
          endTime: LessThanOrEqual(dto.endTime),
        },
        {
          visible: true,
          communityId: communityId,
          votingEndTime: LessThanOrEqual(dto.votingEndTime),
          endTime: MoreThan(dto.endTime),
        },
      ],
    });
  }
}

export const findByState = async (
  delegationRepository: Repository<Delegation>,
  stateToFind: DelegationState,
  timeToFind?: Date,
): Promise<Delegation[]> => {
  if (timeToFind === undefined) {
    timeToFind = new Date();
  }

  if (stateToFind == DelegationState.NOT_START) {
    return delegationRepository.find({
      where: {
        visible: true,
        startTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.APPLYING) {
    return delegationRepository.find({
      where: {
        visible: true,
        startTime: LessThanOrEqual(timeToFind),
        proposalEndTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.DELEGATING) {
    return delegationRepository.find({
      where: {
        visible: true,
        proposalEndTime: LessThanOrEqual(timeToFind),
        votingEndTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.ACTIVE) {
    return delegationRepository.find({
      where: {
        visible: true,
        votingEndTime: LessThanOrEqual(timeToFind),
        endTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.EXPIRED) {
    return delegationRepository.find({
      where: {
        visible: true,
        endTime: LessThanOrEqual(timeToFind),
      },
    });
  }
};

/**
Similar to findByState() above, only add communityId
 * @param delegationRepository 
 * @param communityId 
 * @param stateToFind 
 * @param timeToFind 
 * @returns 
 */
export const findByStateForMultiCommunity = async (
  delegationRepository: Repository<Delegation>,
  communityId: number,
  stateToFind: DelegationState,
  timeToFind?: Date,
): Promise<Delegation[]> => {
  if (timeToFind === undefined) {
    timeToFind = new Date();
  }

  if (stateToFind == DelegationState.NOT_START) {
    return delegationRepository.find({
      where: {
        visible: true,
        communityId: communityId,
        startTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.APPLYING) {
    return delegationRepository.find({
      where: {
        visible: true,
        communityId: communityId,
        startTime: LessThanOrEqual(timeToFind),
        proposalEndTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.DELEGATING) {
    return delegationRepository.find({
      where: {
        visible: true,
        communityId: communityId,
        proposalEndTime: LessThanOrEqual(timeToFind),
        votingEndTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.ACTIVE) {
    return delegationRepository.find({
      where: {
        visible: true,
        communityId: communityId,
        votingEndTime: LessThanOrEqual(timeToFind),
        endTime: MoreThan(timeToFind),
      },
    });
  } else if (stateToFind == DelegationState.EXPIRED) {
    return delegationRepository.find({
      where: {
        visible: true,
        communityId: communityId,
        endTime: LessThanOrEqual(timeToFind),
      },
    });
  }
};