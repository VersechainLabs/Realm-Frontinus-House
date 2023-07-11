import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { Delegate } from 'src/delegate/delegate.entity';
import { Nominee } from './nominee.entity';
import { CreateNomineeDto, GetNomineesDto, LatestDto } from './nominee.types';

export type AuctionWithProposalCount = Delegate & { numProposals: number };

@Injectable()
export class NomineeService {
  constructor(
    @InjectRepository(Nominee) private nomineeRepository: Repository<Nominee>,
    @InjectRepository(Delegate) private delegatesRepository: Repository<Delegate>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
    ) {}

  findAll(): Promise<Nominee[]> {
    return this.nomineeRepository.find({
      // loadRelationIds: {
      //   relations: ['proposals.auction', 'community'],
      // },
      where: {
        visible: true,
      },
    });
  }

  // Chao
  async createNomineeByDelegate(
    // communityId: number, 
    dto: CreateNomineeDto
  ) {
    console.log("createNomineeByDelegate.delegateId:" + dto.delegateId);
    const delegate = await this.delegatesRepository.findOne(dto.delegateId);
    console.log("delegate", delegate);

    if (!delegate) {
      throw new HttpException(
        'Delegate not found. Cannot create nominee',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log("dto:", dto);

    // return new Nominee;

    const newNominee = this.nomineeRepository.create({...dto, delegate});
    // const newNominee = this.nomineeRepository.create({...dto});
    return await this.nomineeRepository.save(newNominee);
  }

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

  // async remove(id: number): Promise<void> {
  //   await this.auctionsRepository.delete(id);
  // }

  async store(value: Nominee): Promise<Nominee> {
    return await this.nomineeRepository.save(value, { reload: true });
  }

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
