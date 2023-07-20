import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto, DelegationState, GetDelegationDto, LatestDto } from './delegation.types';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';

// import { CreateAuctionByCommunityParams } from 'src/utils/dto-types';

export type AuctionWithProposalCount = Delegation & { numProposals: number };

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(Delegation) private delegationRepository: Repository<Delegation>,
    @InjectRepository(Community) private communitiesRepository: Repository<Community>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
  ) {}

  findAll(): Promise<Delegation[]> {
    return this.delegationRepository.find({
      // loadRelationIds: {
      //   relations: ['proposals.auction', 'community'],
      // },
      where: {
        visible: true,
      },
      order: {
        id: "DESC"
      }
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
    await this.auctionsRepository.delete(id);
  }
  
  async getState(id: number, currentTime?: Date): Promise<DelegationState> {
    const delegation = this.delegationRepository.findOne(id, {
      where: { visible: true },
    });

    if (currentTime === undefined) {
      currentTime = new Date;
    }

    if (currentTime < (await delegation).startTime) {
      return DelegationState.NOT_START;
    } 
    else if (currentTime < (await delegation).proposalEndTime) {
      return DelegationState.APPLYING;
    }
    else if (currentTime < (await delegation).votingEndTime) {
      return DelegationState.DELEGATING;
    }
    else if (currentTime < (await delegation).endTime) {
      return DelegationState.ACTIVE;
    }
    else {
      return DelegationState.EXPIRED;
    }
  }

  // findAllForCommunity(id: number): Promise<AuctionWithProposalCount[]> {
  //   return (
  //     this.auctionsRepository
  //       .createQueryBuilder('a')
  //       .select('a.*')
  //       .where('a.community.id = :id', { id })
  //       // This select adds a new property, reflected in AuctionWithProposalCount
  //       .addSelect('SUM(p."numProposals")', 'numProposals')
  //       .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
  //       .groupBy('a.id')
  //       .getRawMany()
  //   );
  // }
  // findAllActive(dto: GetAuctionsDto): Promise<Auction[]> {
  //   return this.auctionsRepository
  //     .createQueryBuilder('a')
  //     .select('a.*')
  //     .addSelect('SUM(p."numProposals")', 'numProposals')
  //     .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
  //     .groupBy('a.id')
  //     .offset(dto.skip)
  //     .limit(dto.limit)
  //     .addSelect(
  //       'CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime THEN 1 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime THEN 2 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime THEN 3 ELSE 4 END END END',
  //       'auction_order',
  //     )
  //     .orderBy('auction_order', 'ASC')
  //     .getRawMany();
  // }

  // findAllActiveForCommunities(dto: GetAuctionsDto): Promise<Auction[]> {
  //   return this.auctionsRepository
  //     .createQueryBuilder('a')
  //     .select('a.*')
  //     .addSelect('SUM(p."numProposals")', 'numProposals')
  //     .leftJoin(proposalCountSubquery, 'p', 'p."auctionId" = a.id')
  //     .leftJoin('a.community', 'c')
  //     .groupBy('a.id, c.contractAddress')
  //     .offset(dto.skip)
  //     .limit(dto.limit)
  //     .addSelect(
  //       'CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 1 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 2 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime AND LOWER(c.contractAddress) IN (:...addresses) THEN 3 ELSE CASE WHEN CURRENT_TIMESTAMP > a.proposalEndTime AND CURRENT_TIMESTAMP < a.votingEndTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 4 ELSE CASE WHEN CURRENT_TIMESTAMP > a.startTime AND CURRENT_TIMESTAMP < a.proposalEndTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 5 ELSE CASE WHEN CURRENT_TIMESTAMP < a.startTime AND LOWER(c.contractAddress) NOT IN (:...addresses) THEN 6 ELSE 7 END END END END END END',
  //       'auction_order',
  //     )
  //     .setParameter('addresses', dto.addresses)
  //     .orderBy('auction_order', 'ASC')
  //     .addOrderBy('a.votingEndTime', 'DESC')
  //     .getRawMany();
  // }

  // latestNumProps(dto: LatestDto): Promise<number> {
  //   const timestamp = new Date(dto.timestamp); // Convert Unix timestamp (ms) to Date object
  //   return this.auctionsRepository
  //     .createQueryBuilder('a')
  //     .leftJoin('a.proposals', 'p')
  //     .select('COUNT(p.id)', 'numProposals')
  //     .where('a.id = :auctionId AND p.createdDate > :timestamp', {
  //       auctionId: dto.auctionId,
  //       timestamp: timestamp,
  //     })
  //     .getRawOne()
  //     .then((result) => result.numProposals);
  // }

  // latestNumVotes(dto: LatestDto): Promise<number> {
  //   const timestamp = new Date(dto.timestamp); // Convert Unix timestamp (ms) to Date object
  //   return this.auctionsRepository
  //     .createQueryBuilder('a')
  //     .leftJoinAndSelect('a.proposals', 'p')
  //     .leftJoinAndSelect('p.votes', 'v')
  //     .where('a.id = :auctionId AND v.createdDate > :timestamp', {
  //       auctionId: dto.auctionId,
  //       timestamp: timestamp,
  //     })
  //     .getOne()
  //     .then((auction) => {
  //       if (!auction) return 0; // Auction not found
  //       return auction.proposals.reduce((totalVotes, proposal) => {
  //         return (
  //           totalVotes +
  //           proposal.votes.reduce((totalWeight, vote) => {
  //             return totalWeight + Number(vote.weight);
  //           }, 0)
  //         );
  //       }, 0);
  //     });
  // }

  // findWithNameForCommunity(name: string, id: number): Promise<Auction> {
  //   const parsedName = name.replaceAll('-', ' '); // parse slug to name
  //   return this.auctionsRepository
  //     .createQueryBuilder('a')
  //     .select('a.*')
  //     .where('a.title ILIKE :parsedName', { parsedName }) // case insensitive
  //     .andWhere('a.community.id = :id', { id })
  //     .getRawOne();
  // }

  // findOne(id: number): Promise<Auction> {
  //   return this.auctionsRepository.findOne(id, {
  //     relations: ['proposals'],
  //     loadRelationIds: {
  //       relations: ['community'],
  //     },
  //     where: { visible: true },
  //   });
  // }

  // findOneWithCommunity(id: number): Promise<Auction> {
  //   return this.auctionsRepository.findOne(id, {
  //     relations: ['proposals', 'community'],
  //     where: { visible: true },
  //   });
  // }

  // findWhere(
  //   start: number,
  //   limit: number,
  //   where: Partial<Auction>,
  //   relations: string[] = [],
  //   relationIds?: string[],
  // ) {
  //   return this.auctionsRepository.find({
  //     skip: start,
  //     take: limit,
  //     where,
  //     order: { id: 'ASC' },
  //     relations,
  //     loadRelationIds: relationIds ? { relations: relationIds } : undefined,
  //   });
  // }


  // // Chao
  // async createAuctionByCommunity(
  //   // communityId: number, 
  //   createAcutionDetails: CreateAuctionDto
  // ) {
  //   // console.log("createAcutionDetails.communityId:" + createAcutionDetails.communityId);
  //   const community = await this.communitiesRepository.findOne(createAcutionDetails.communityId);

  //   if (!community) {
  //     throw new HttpException(
  //       'Community not found. Cannot create auction',
  //       HttpStatus.BAD_REQUEST,
  //     );
  //   }

  //   const newAuction = this.auctionsRepository.create({...createAcutionDetails, community});
  //   const savedAuction = await this.auctionsRepository.save(newAuction);
    
  //   return savedAuction;
  // }
}
