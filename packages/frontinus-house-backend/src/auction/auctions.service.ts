import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from '../utils/proposal-count-subquery';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Auction } from './auction.entity';
import { CreateAuctionDto, GetAuctionsDto, LatestDto } from './auction.types';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';
import { Proposal } from '../proposal/proposal.entity';
import { ParseDate } from '../utils';
import { Delegate } from '../delegate/delegate.entity';
import { Delegation } from '../delegation/delegation.entity';

export type AuctionWithProposalCount = Auction & { numProposals: number };

@Injectable()
export class AuctionsService {
  constructor(
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
    private readonly blockchainService: BlockchainService,

    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
  ) {}

  findAll(): Promise<Auction[]> {
    return this.auctionsRepository.find({
      loadRelationIds: {
        relations: ['proposals.auction', 'community'],
      },
      where: {
        visible: true,
      },
    });
  }

  findAllForCommunityByVisible(
    communityId: number,
    visibleStatus?: AuctionVisibleStatus,
  ): Promise<Auction[]> {
    const where: any = {
      community: { id: communityId },
    };

    if (visibleStatus !== undefined && !isNaN(visibleStatus)) {
      where.visibleStatus = visibleStatus;
    }

    return this.auctionsRepository.find({
      loadRelationIds: {
        relations: ['proposals.auction', 'community'],
      },
      where,
    });
  }

  findAllForCommunity(id: number): Promise<AuctionWithProposalCount[]> {
    return (
      this.auctionsRepository
        .createQueryBuilder('a')
        .select('a.*')
        .where('a.community.id = :id', { id })
        // This select adds a new property, reflected in AuctionWithProposalCount
        .addSelect('SUM(p."numProposals")', 'numProposals')
        .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
        .groupBy('a.id')
        .getRawMany()
    );
  }

  findAllActive(dto: GetAuctionsDto): Promise<Auction[]> {
    return this.auctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .addSelect('SUM(p."numProposals")', 'numProposals')
      .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
      .groupBy('a.id')
      .offset(dto.skip)
      .limit(dto.limit)
      .addSelect(
        'CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime THEN 1 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime THEN 2 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime THEN 3 ELSE 4 END END END',
        'auction_order',
      )
      .orderBy('auction_order', 'ASC')
      .getRawMany();
  }

  findAllActiveForCommunities(dto: GetAuctionsDto): Promise<Auction[]> {
    return this.auctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .addSelect('SUM(p."numProposals")', 'numProposals')
      .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
      .leftJoin('a.community', 'c')
      .groupBy('a.id, c.contractAddress')
      .offset(dto.skip)
      .limit(dto.limit)
      .addSelect(
        'CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 1 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 2 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 3 ELSE CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 4 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 5 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 6 ELSE 7 END END END END END END',
        'auction_order',
      )
      .setParameter('addresses', dto.addresses)
      .orderBy('auction_order', 'ASC')
      .addOrderBy('a.votingEndTime', 'DESC')
      .getRawMany();
  }

  latestNumProps(dto: LatestDto): Promise<number> {
    const timestamp = new Date(dto.timestamp); // Convert Unix timestamp (ms) to Date object
    return this.auctionsRepository
      .createQueryBuilder('a')
      .leftJoin('a.proposals', 'p')
      .select('COUNT(p.id)', 'numProposals')
      .where('a.id = :auctionId AND p.createdDate > :timestamp', {
        auctionId: dto.auctionId,
        timestamp: timestamp,
      })
      .getRawOne()
      .then((result) => result.numProposals);
  }

  latestNumVotes(dto: LatestDto): Promise<number> {
    const timestamp = new Date(dto.timestamp); // Convert Unix timestamp (ms) to Date object
    return this.auctionsRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.proposals', 'p')
      .leftJoinAndSelect('p.votes', 'v')
      .where('a.id = :auctionId AND v.createdDate > :timestamp', {
        auctionId: dto.auctionId,
        timestamp: timestamp,
      })
      .getOne()
      .then((auction) => {
        if (!auction) return 0; // Auction not found
        return auction.proposals.reduce((totalVotes, proposal) => {
          return (
            totalVotes +
            proposal.votes.reduce((totalWeight, vote) => {
              return totalWeight + Number(vote.weight);
            }, 0)
          );
        }, 0);
      });
  }

  findWithNameForCommunity(name: string, id: number): Promise<Auction> {
    const parsedName = name.replaceAll('-', ' '); // parse slug to name
    return this.auctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.title ILIKE :parsedName', { parsedName }) // case insensitive
      .andWhere('a.community.id = :id', { id })
      .getRawOne();
  }

  findWithIDForCommunity(id: number): Promise<Auction> {
    return this.auctionsRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.id=:id', { id })
      .getRawOne();
  }

  findOne(id: number): Promise<Auction> {
    return this.auctionsRepository.findOne(id, {
      relations: ['proposals'],
      loadRelationIds: {
        relations: ['community'],
      },
      where: { visible: true },
    });
  }

  findOneWithCommunity(id: number): Promise<Auction> {
    return this.auctionsRepository.findOne(id, {
      relations: ['proposals', 'community'],
      where: { visible: true },
    });
  }

  findWhere(
    start: number,
    limit: number,
    where: Partial<Auction>,
    relations: string[] = [],
    relationIds?: string[],
  ) {
    return this.auctionsRepository.find({
      skip: start,
      take: limit,
      where,
      order: { id: 'ASC' },
      relations,
      loadRelationIds: relationIds ? { relations: relationIds } : undefined,
    });
  }

  async remove(id: number): Promise<void> {
    await this.auctionsRepository.delete(id);
  }

  async store(auction: Auction): Promise<Auction> {
    return await this.auctionsRepository.save(auction, { reload: true });
  }

  // Chao
  async createAuctionByCommunity(dto: CreateAuctionDto, isAdmin: boolean) {
    const community = await this.communitiesRepository.findOne(dto.communityId);

    if (!community) {
      throw new HttpException(
        'Community not found. Cannot create auction',
        HttpStatus.BAD_REQUEST,
      );
    }

    const startTime = dto.startTime ? dto.startTime : new Date();
    if (
      dto.startTime >= dto.proposalEndTime ||
      dto.proposalEndTime >= dto.votingEndTime
    ) {
      throw new HttpException('Time order incorrect!', HttpStatus.BAD_REQUEST);
    }

    const newAuction = this.auctionsRepository.create({
      ...dto,
      community,
    });

    newAuction.visibleStatus = isAdmin
      ? AuctionVisibleStatus.NORMAL
      : AuctionVisibleStatus.PENDING;
    newAuction.balanceBlockTag =
      await this.blockchainService.getCurrentBlockNum();

    // noinspection ES6MissingAwait: Just a cache, no need await
    this.blockchainService.cacheAll(
      this.delegateRepository,
      this.delegationRepository,
      community.contractAddress,
      newAuction.balanceBlockTag,
    );

    return await this.auctionsRepository.save(newAuction);
  }
}
