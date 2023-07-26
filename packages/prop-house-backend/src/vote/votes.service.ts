import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  Repository,
} from 'typeorm';
import { Vote } from './vote.entity';
import { DelegatedVoteDto, GetVoteDto } from './vote.types';
import { Proposal } from 'src/proposal/proposal.entity';
import config from 'src/config/configuration';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Auction } from '../auction/auction.entity';
import { DelegationState } from '../delegation/delegation.types';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { SnapshotService } from 'src/voting-power-snapshot/snapshot.service';

@Injectable()
export class VotesService {
  private readonly communityAddress = config().communityAddress;

  constructor(
    @InjectRepository(Vote)
    private votesRepository: Repository<Vote>,
    private readonly blockchainService: BlockchainService,
    private readonly snapshotService: SnapshotService,
    private readonly delegationService: DelegationService,
    private readonly delegateService: DelegateService,
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

  findOne(id: number): Promise<Vote> {
    return this.votesRepository.findOne(id);
  }

  findBy(auctionId: number, address: string): Promise<Vote> {
    return this.votesRepository.findOne({
      where: { address, auctionId },
    });
  }

  async remove(id: string): Promise<void> {
    await this.votesRepository.delete(id);
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
    balanceBlockTag: number,
  ): Promise<number> {
    return this.blockchainService.getVotingPowerWithSnapshot(
      address,
      // this.communityAddress,
      balanceBlockTag,
    );
  }

  async createNewVoteList(voteDtoList: DelegatedVoteDto[], proposal: Proposal) {
    const voteList = [];
    for (const createVoteDto of voteDtoList) {
      voteList.push(
        new Vote({
          address: createVoteDto.address,
          direction: createVoteDto.direction,
          signedData: createVoteDto.signedData,
          signatureState: createVoteDto.signatureState,
          proposalId: createVoteDto.proposalId,
          auctionId: proposal.auctionId,
          weight: createVoteDto.weight,
          actualWeight: createVoteDto.actualWeight,
          blockHeight: createVoteDto.blockHeight,
          domainSeparator: createVoteDto.domainSeparator,
          messageTypes: createVoteDto.messageTypes,
          delegateId: createVoteDto.delegateId,
          delegateAddress: createVoteDto.delegateAddress,
        }),
      );
    }
    return await this.storeMany(voteList);
  }

  async getDelegateListByAuction(address: string, auction: Auction) {
    // Check if user has delegated to other user.
    const currentDelegationList = await this.delegationService.findByState(
      DelegationState.ACTIVE,
      auction.createdDate,
    );
    const currentDelegation =
      currentDelegationList.length > 0 ? currentDelegationList[0] : null;
    if (!currentDelegation) {
      return [];
    }

    const fromDelegate = await this.delegateService.findByFromAddress(
      currentDelegation.id,
      address,
    );
    if (fromDelegate) {
      throw new HttpException(
        `user has already been delegated for other user`,
        HttpStatus.FORBIDDEN,
      );
    }

    // Get delegate list for calculate voting power
    return await this.delegateService.getDelegateListByAddress(
      currentDelegation.id,
      address,
    );
  }
}
