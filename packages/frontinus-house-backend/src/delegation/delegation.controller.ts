import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ParseDate } from '../utils/date';
import { Delegation } from './delegation.entity';
import { CreateDelegationDto, GetDelegationDto } from './delegation.types';
import { DelegationService } from './delegation.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminService } from '../admin/admin.service';

@Controller('delegations')
export class DelegationController {
  [x: string]: any;

  constructor(
    private readonly delegationService: DelegationService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Delegation],
  })
  async getAll(@Body() dto: GetDelegationDto): Promise<Delegation[]> {
    return this.delegationService.findAll();
  }

  @Post('/create')
  @ApiOkResponse({
    type: Delegation,
  })
  async create(@Body() dto: CreateDelegationDto): Promise<Delegation> {
    // Open this feature later:
    // if (await this.adminService.isAdmin(dto.address) !== true) {
    // throw new HttpException(
    //   'Need admin access!',
    //   HttpStatus.BAD_REQUEST,
    // );
    // }

    // Check if the current input parameter's time is correct.
    const startTime = dto.startTime ? ParseDate(dto.startTime) : new Date();
    if (
      startTime >= dto.proposalEndTime ||
      dto.proposalEndTime >= dto.votingEndTime ||
      dto.votingEndTime >= dto.endTime
    ) {
      throw new HttpException('Time order incorrect!', HttpStatus.BAD_REQUEST);
    }

    // Check whether the effective time of the current incoming delegation conflicts with the existing delegation.
    const conflictDelegateList =
      await this.delegationService.getConflictDelegateByTimeRange(dto);
    if (conflictDelegateList.length > 0) {
      throw new HttpException(
        `The effective time of the delegation conflicts with the delegation: ${conflictDelegateList[0].title}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const delegation = new Delegation();
    delegation.title = dto.title;
    delegation.description = dto.description;
    delegation.startTime = startTime;
    delegation.proposalEndTime = ParseDate(dto.proposalEndTime);
    delegation.votingEndTime = ParseDate(dto.votingEndTime);
    delegation.endTime = ParseDate(dto.endTime);
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
  @ApiOkResponse({
    type: Boolean,
  })
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
