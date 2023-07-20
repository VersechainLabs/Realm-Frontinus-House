import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto } from './application.types';
import { DelegationService } from 'src/delegation/delegation.service';
import { ApplicationService } from './application.service';

@Controller('applications')
export class ApplicationController {
  [x: string]: any;
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly delegationService: DelegationService,
  ) {}

  @Get('/list')
  getAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get('/byDelegation/:delegationId')
  async findByDelegation(
    @Param('delegationId') delegationId: number,
    @Body() dto: GetApplicationDto,
  ) {
    const applictions = await this.applicationService.findByDelegation(
      delegationId,
      dto,
    );
    if (!applictions)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    return applictions;
  }

  @Post('/create')
  async create(@Body() dto: CreateApplicationDto): Promise<Application> {
    console.log('create appliction:', dto.delegationId);

    return await this.applicationService.createApplicationByDelegation(dto);
  }

  // // Chao
  // @Post()
  // async createForCommunity(
  //   // @Param('communityId', ParseIntPipe) communityId: number,
  //   @Body() createDelegateDto: createDelegateDto): Promise<Auction>
  // {
  //   const newAuction = await this.auctionsService.createAuctionByCommunity(createDelegateDto);

  //   return newAuction;
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: number): Promise<Auction> {
  //   const foundAuction = await this.auctionsService.findOne(id);
  //   if (!foundAuction)
  //     throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
  //   return foundAuction;
  // }

  // @Get('/forCommunity/:id')
  // async findAllForCommunity(
  //   @Param('id') id: number,
  // ): Promise<AuctionWithProposalCount[]> {
  //   const auctions = await this.auctionsService.findAllForCommunity(id);
  //   if (!auctions)
  //     throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
  //   auctions.map((a) => (a.numProposals = Number(a.numProposals) || 0));
  //   return auctions;
  // }

  // @Get('/:name/community/:id')
  // async findWithNameForCommunity(
  //   @Param('id') id: number,
  //   @Param('name') name: string,
  // ): Promise<Auction> {
  //   const auction = await this.auctionsService.findWithNameForCommunity(
  //     name,
  //     id,
  //   );
  //   if (!auction)
  //     throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
  //   return auction;
  // }

  // @Get(':id/proposals')
  // async find(
  //   @Param('id') id: number,
  // ): Promise<(Proposal | InfiniteAuctionProposal)[]> {
  //   const foundProposals = await this.proposalService.findAllWithAuctionId(id);
  //   if (!foundProposals)
  //     throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
  //   return foundProposals;
  // }
  // l;

  // @Get(':id/rollUpProposals')
  // async findAll(
  //   @Param('id') id: number,
  // ): Promise<(Proposal | InfiniteAuctionProposal)[]> {
  //   const foundProposals = await this.proposalService.findAllWithAuctionId(id);
  //   if (!foundProposals)
  //     throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
  //   for (let index = 0; index < foundProposals.length; index++) {
  //     await this.proposalService.rollupVoteCount(foundProposals[index].id);
  //   }
  //   return foundProposals;
  // }

  // @Get('allActive/:n')
  // async findAllActive(@Query() dto: GetAuctionsDto): Promise<Auction[]> {
  //   const auctions = await this.auctionsService.findAllActive(dto);
  //   if (!auctions)
  //     throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
  //   return auctions;
  // }

  // @Get('active/:n')
  // async findAllActiveForCommunities(
  //   @Query() dto: GetAuctionsDto,
  // ): Promise<Auction[]> {
  //   const auctions = await this.auctionsService.findAllActiveForCommunities(
  //     dto,
  //   );
  //   if (!auctions)
  //     throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
  //   return auctions;
  // }

  // @Get('latestNumProps/:n')
  // async latestNumProps(@Query() dto: LatestDto): Promise<number> {
  //   const numProps = await this.auctionsService.latestNumProps(dto);
  //   if (numProps === undefined)
  //     throw new HttpException(
  //       `Error fetching num props for ${dto.auctionId} `,
  //       HttpStatus.NOT_FOUND,
  //     );
  //   return Number(numProps);
  // }

  // @Get('latestNumVotes/:n')
  // async latestNumVotes(@Query() dto: LatestDto): Promise<number> {
  //   const numVotes = await this.auctionsService.latestNumVotes(dto);
  //   if (numVotes === undefined)
  //     throw new HttpException(
  //       `Error fetching num props for ${dto.auctionId} `,
  //       HttpStatus.NOT_FOUND,
  //     );
  //   return Number(numVotes);
  // }
}
