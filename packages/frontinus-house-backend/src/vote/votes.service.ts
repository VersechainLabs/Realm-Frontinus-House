import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { Vote } from './vote.entity';
import { DelegatedVoteDto, GetVoteDto, VotingPower } from './vote.types';
import { Proposal } from '../proposal/proposal.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Auction } from '../auction/auction.entity';
import { DelegationState } from '../delegation/delegation.types';
import { findByStateForMultiCommunity } from '../delegation/delegation.service';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { VoteStates, VoteStatesClass } from '@nouns/frontinus-house-wrapper';
import { Delegation } from '../delegation/delegation.entity';
import { Delegate } from '../delegate/delegate.entity';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
  ) {}

  async findAll(opts?: FindManyOptions<Vote>): Promise<Vote[]> {
    return this.votesRepository.find(opts);
  }

  findAllWithOpts(dto: GetVoteDto): Promise<Vote[]> {
    const q = this.votesRepository
      .createQueryBuilder('v')
      .skip(dto.skip)
      .take(dto.limit)
      .orderBy('v.createdDate', dto.order)
      .leftJoin('v.proposal', 'p')
      .addSelect('p');

    if (dto.addresses && dto.addresses.length > 0)
      q.leftJoin('p.auction', 'a')
        .leftJoin('a.community', 'c')
        .where('LOWER(c.contractAddress) IN (:...addresses)', {
          addresses: dto.addresses.map((addr) => addr.toLowerCase()),
        });

    return q.getMany();
  }

  async findAllByAuctionId(auctionId: number): Promise<Vote[]> {
    return await this.votesRepository.find({ where: { auctionId } });
  }

  async findAllByCommunityAddresses(addresses: string[]): Promise<Vote[]> {
    return this.votesRepository
      .createQueryBuilder('v')
      .leftJoin('v.proposal', 'p')
      .leftJoin('p.auction', 'a')
      .leftJoin('a.community', 'c')
      .where('LOWER(c.contractAddress) IN (:...addresses)', {
        addresses: addresses.map((addr) => addr.toLowerCase()),
      })
      .addSelect('p')
      .getMany();
  }

  findOne(opt?: FindOneOptions<Vote>): Promise<Vote> {
    return this.votesRepository.findOne(opt);
  }

  findBy(auctionId: number, address: string): Promise<Vote[]> {
    return this.votesRepository.find({
      where: { address, auctionId },
    });
  }

  findOneBy(opt?: FindOneOptions<Vote>): Promise<Vote> {
    return this.votesRepository.findOne(opt);
  }

  async remove(id: number): Promise<void> {
    await this.votesRepository.softDelete(id);
  }

  async removeMany(ids: number[]): Promise<void> {
    await this.votesRepository.softDelete(ids);
  }

  async store(vote: DeepPartial<Vote>) {
    return this.votesRepository.save(vote);
  }

  async storeMany(voteList: DeepPartial<Vote>[]) {
    return this.votesRepository.save(voteList);
  }

  async findByAddress(address: string, conditions?: FindConditions<Vote>) {
    return this.votesRepository.find({
      relations: ['proposal'],
      where: { ...conditions, address },
    });
  }

  async getNumVotesByAccountAndRoundId(account: string, roundId: number) {
    const votes = await this.votesRepository
      .createQueryBuilder('v')
      .where('address = :account', { account })
      .andWhere('v.auctionId = :roundId', { roundId })
      .getMany();
    return votes.reduce((sum, vote) => sum + Number(vote.weight), 0);
  }

  async getVotingPower(
    address: string,
    auction: Auction,
    delegate: boolean,
  ): Promise<VotingPower> {
    let votingPower = await this.blockchainService.getVotingPowerWithSnapshot(
      address,
      auction.community.contractAddress,
      auction.balanceBlockTag,
    );

    const result = {
      address: address,
      weight: votingPower,
      actualWeight: votingPower,
      blockNum: auction.balanceBlockTag,
    } as VotingPower;

    if (delegate) {
      const delegateList = await this.getDelegateListByAuction(
        address,
        auction,
      );

      if (delegateList.length > 0) {
        result.delegateList = [];
      }
      const _blockchainService = this.blockchainService;
      votingPower = await delegateList.reduce(
        async (prevVotingPower, currentDelegate) => {
          const currentVotingPower =
            await _blockchainService.getVotingPowerWithSnapshot(
              currentDelegate.fromAddress,
              auction.community.contractAddress,
              auction.balanceBlockTag,
            );

          result.delegateList.push({
            address: currentDelegate.fromAddress,
            weight: 0,
            actualWeight: currentVotingPower,
            blockNum: auction.balanceBlockTag,
          } as VotingPower);

          return (await prevVotingPower) + currentVotingPower;
        },
        Promise.resolve(votingPower),
      );
      result.weight = votingPower;
    }

    return result;
  }

  /**
   * Check if the vote is valid. The checks include:
   * - The proposal is within the valid voting period
   * - The address has not voted in this round
   * - The address has not delegated to another address
   * - The address has voting power
   */
  async checkEligibleToVote(
    proposal: Proposal,
    auction: Auction,
    address: string,
    checkVotingPower = true,
  ): Promise<VoteStatesClass> {
    const currentTime = new Date();
    if (
      currentTime < auction.proposalEndTime ||
      currentTime > auction.votingEndTime
    ) {
      return VoteStates.NOT_VOTING;
    }

    if (proposal.votes) {
      // Check if the current user has voted in this proposal, and if so, the frontend needs to display the "Delete Vote" button.
      // The back-end does not need that state. The back-end can vote repeatedly on the same proposal to increase its weight.
      for (const vote of proposal.votes) {
        if (vote.address === address) {
          // return VoteStates.VOTED;
          // Check if this is a delegated-vote, or user-direct-vote:
          return vote.delegateAddress ? VoteStates.ALREADY_DELEGATED : VoteStates.VOTED;
        }
      }
    }

    let remainVotingPower = 0;
    if (checkVotingPower) {
      try {
        const vp = await this.getVotingPower(address, auction, true);
        if (vp.weight === 0) {
          return VoteStates.NO_POWER;
        } else {
          // Check if user has voted for this round, Protect against casting same vote twice
          const sameAuctionVoteList = await this.findBy(auction.id, address);
          const prevVpSum = sameAuctionVoteList.reduce(
            (totalVps, vote) => totalVps + vote.weight,
            0,
          );

          if (prevVpSum >= vp.weight) {
            return VoteStates.VOTED_ANOTHER;
          } else {
            remainVotingPower = vp.weight - prevVpSum;
          }
        }
      } catch (error) {
        return VoteStates.ALREADY_DELEGATED;
      }
    }

    const result = VoteStates.OK;
    result.votingPower = remainVotingPower;
    return result;
  }


  async createNewVoteList(voteDtoList: DelegatedVoteDto[], proposal: Proposal) {
    const voteList = [];
    for (const createVoteDto of voteDtoList) {
      voteList.push(
        new Vote({
          address: createVoteDto.address,
          proposalId: createVoteDto.proposalId,
          auctionId: proposal.auctionId,
          weight: createVoteDto.weight,
          actualWeight: createVoteDto.actualWeight,
          blockHeight: createVoteDto.blockHeight,
          delegateId: createVoteDto.delegateId,
          delegateAddress: createVoteDto.delegateAddress,
        }),
      );
    }
    return await this.storeMany(voteList);
  }

  async getDelegateListByAuction(address: string, auction: Auction) {

    // Check if user has delegated to other user.
    const currentDelegationList = await findByStateForMultiCommunity(
      this.delegationRepository,
      auction.community.id,
      DelegationState.ACTIVE,
      auction.createdDate,
    );

    // Should be only 1 active delegation for 1 community:
    const currentDelegation =
      currentDelegationList.length > 0 ? currentDelegationList[0] : null;
    if (!currentDelegation) {
      return [];
    }

    const fromDelegate = await this.delegateRepository.findOne({
      where: { delegationId: currentDelegation.id, fromAddress: address },
    });
    if (fromDelegate) {
      throw new HttpException(
        `user has already been delegated for other user`,
        HttpStatus.FORBIDDEN,
      );
    }

    // Get delegate list for calculate voting power
    return await this.delegateRepository.find({
      where: {
        delegationId: currentDelegation.id,
        toAddress: address,
      },
    });
  }
}
