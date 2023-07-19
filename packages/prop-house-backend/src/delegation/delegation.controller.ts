import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ParseDate } from 'src/utils/date';
import { Delegation } from './delegation.entity';
import {
  CreateDelegationDto,
  DelegationState,
  GetDelegationDto,
} from './delegation.types';
import { DelegationService } from './delegation.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { AdminService } from 'src/admin/admin.service';

@Controller('delegations')
export class DelegationController {
  [x: string]: any;

  constructor(
    private readonly delegationService: DelegationService,
    private readonly proposalService: ProposalsService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/:id/state')
  async getState(@Param('id') id: number): Promise<DelegationState> {
    const testDate: Date = new Date('2023-01-30 00:00:04.000000');

    // testDate is Optional:
    return this.delegationService.getState(id, testDate);
  }

  @Get('/list')
  async getAll(@Body() dto: GetDelegationDto): Promise<Delegation[]> {
    // const adminList = await this.adminService.findAll();

    // const isAdmin = adminList.find((v) => v.address === dto.address);

    // if (!isAdmin)
    // throw new HttpException(
    //   'Need admin access!',
    //   HttpStatus.BAD_REQUEST,
    // );

    return this.delegationService.findAll();
  }

  @Post('/create')
  async create(
    @Body() createDelegationDto: CreateDelegationDto,
  ): Promise<Delegation> {
    const delegation = new Delegation();
    delegation.title = createDelegationDto.title;
    delegation.description = createDelegationDto.description;
    delegation.startTime = createDelegationDto.startTime
      ? ParseDate(createDelegationDto.startTime)
      : new Date();
    delegation.proposalEndTime = ParseDate(createDelegationDto.proposalEndTime);
    delegation.votingEndTime = ParseDate(createDelegationDto.votingEndTime);
    delegation.endTime = ParseDate(createDelegationDto.endTime);
    return this.delegationService.store(delegation);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Delegation> {
    const foundDelegation = await this.delegationService.findOne(id);

    if (!foundDelegation)
      throw new HttpException('Delegation not found', HttpStatus.NOT_FOUND);

    return foundDelegation;
  }

  @Post('/:id/delete')
  async delete(@Param('id') id: number): Promise<boolean> {
    await this.delegationService.remove(id);
    return true;
  }

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
