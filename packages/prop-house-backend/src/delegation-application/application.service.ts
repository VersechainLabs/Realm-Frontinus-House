import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto, LatestDto } from './application.types';

export type AuctionWithProposalCount = Delegation & { numProposals: number };

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application) private applicationRepository: Repository<Application>,
    @InjectRepository(Delegation) private delegationRepository: Repository<Delegation>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
    ) {}

  findAll(): Promise<Application[]> {
    return this.applicationRepository.find({
      // loadRelationIds: {
      //   relations: ['proposals.auction', 'community'],
      // },
      where: {
        visible: true,
      },
    });
  }

  // Chao
  async createApplicationByDelegation(
    // communityId: number, 
    dto: CreateApplicationDto
  ) {
    const delegation = await this.delegationRepository.findOne(dto.delegationId);
    console.log("delegation", delegation);

    if (!delegation) {
      throw new HttpException(
        'Delegation not found. Cannot create application',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log("dto:", dto);

    const newApplicaiton = this.applicationRepository.create({...dto, delegation});
    return await this.applicationRepository.save(newApplicaiton);
  }

  async findByDelegation(delegationId: number, dto: GetApplicationDto): Promise<Application[]> {
    return await this.applicationRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.delegationId = :deId', { deId: delegationId })
      .offset(dto.skip)
      .limit(dto.limit)
      .orderBy('id', dto.order)
      .getRawMany();
  }
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

  async store(value: Application): Promise<Application> {
    return await this.applicationRepository.save(value, { reload: true });
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
