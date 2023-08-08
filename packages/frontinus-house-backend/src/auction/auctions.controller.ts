import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Auction } from './auction.entity';
import {
  ApproveAuctionDto,
  CreateAuctionDto,
  GetAuctionsDto,
  LatestDto,
} from './auction.types';
import { AuctionsService, AuctionWithProposalCount } from './auctions.service';
import { ProposalsService } from '../proposal/proposals.service';
import { Proposal } from '../proposal/proposal.entity';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
} from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { AdminService } from '../admin/admin.service';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';

@Controller('auctions')
export class AuctionsController {
  [x: string]: any;

  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly proposalService: ProposalsService,
    private readonly adminService: AdminService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: [Auction],
  })
  getVotes(): Promise<Auction[]> {
    return this.auctionsService.findAll();
  }

  // Chao
  @Post('/create')
  @ApiOkResponse({
    type: Auction,
  })
  async createForCommunity(
    @Body(SignedPayloadValidationPipe) dto: CreateAuctionDto,
  ): Promise<Auction> {
    return await this.auctionsService.createAuctionByCommunity(
      dto,
      await this.adminService.isAdmin(dto.address),
    );
  }

  @Post('approve')
  @ApiOkResponse({ type: Auction })
  async approveAuction(
    @Body(SignedPayloadValidationPipe) dto: ApproveAuctionDto,
  ): Promise<Auction> {
    verifySignPayload(dto, ['id']);
    const foundAuction = await this.auctionsService.findOne(dto.id);
    if (!foundAuction) {
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    }

    if (!(await this.adminService.isAdmin(dto.address))) {
      throw new HttpException('Need admin access!', HttpStatus.BAD_REQUEST);
    }

    foundAuction.visibleStatus = AuctionVisibleStatus.NORMAL;
    return await this.auctionsService.store(foundAuction);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Auction,
  })
  async findOne(@Param('id') id: number): Promise<Auction> {
    const foundAuction = await this.auctionsService.findOne(id);
    if (!foundAuction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return foundAuction;
  }

  @Get('/forCommunity/:id')
  async findAllForCommunity(
    @Param('id') id: number,
    @Query('visibleStatus') visibleStatus?: AuctionVisibleStatus,
  ): Promise<Auction[]> {
    const auctions = await this.auctionsService.findAllForCommunityByVisible(
      id,
      visibleStatus,
    );
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    // auctions.map((a) => (a.numProposals = Number(a.numProposals) || 0));
    return auctions;
  }

  @Get('/:name/community/:id')
  @ApiOkResponse({
    type: Auction,
  })
  async findWithNameForCommunity(
    @Param('id') id: number,
    @Param('name') name: string,
  ): Promise<Auction> {
    const auction = await this.auctionsService.findWithNameForCommunity(
      name,
      id,
    );
    if (!auction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auction;
  }

  @Get('/pk/:id')
  @ApiOkResponse({
    type: Auction,
  })
  async findWithIDForCommunity(@Param('id') id: number): Promise<Auction> {
    const auction = await this.auctionsService.findWithIDForCommunity(id);
    if (!auction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auction;
  }

  @Get(':id/proposals')
  @ApiOperation({ summary: 'Find proposals by Auction ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Auction ID' })
  @ApiOkResponse({
    description: 'Proposals found and returned successfully',
    type: [Proposal],
  })
  @ApiNotFoundResponse({ description: 'Proposals not found' })
  async find(@Param('id') id: number): Promise<Proposal[]> {
    const foundProposals = await this.proposalService.findAllWithAuctionId(id);
    if (!foundProposals)
      throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
    return foundProposals;
  }

  @Get(':id/rollUpProposals')
  @ApiOkResponse({
    type: [Proposal],
  })
  async findAll(@Param('id') id: number): Promise<Proposal[]> {
    const foundProposals = await this.proposalService.findAllWithAuctionId(id);
    if (!foundProposals)
      throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
    for (let index = 0; index < foundProposals.length; index++) {
      await this.proposalService.rollupVoteCount(foundProposals[index].id);
    }
    return foundProposals;
  }

  @Get('allActive/:n')
  @ApiOkResponse({
    type: [Auction],
  })
  async findAllActive(@Query() dto: GetAuctionsDto): Promise<Auction[]> {
    const auctions = await this.auctionsService.findAllActive(dto);
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auctions;
  }

  @Get('active/:n')
  @ApiOkResponse({
    type: [Auction],
  })
  async findAllActiveForCommunities(
    @Query() dto: GetAuctionsDto,
  ): Promise<Auction[]> {
    const auctions = await this.auctionsService.findAllActiveForCommunities(
      dto,
    );
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auctions;
  }

  @Get('latestNumProps/:n')
  async latestNumProps(@Query() dto: LatestDto): Promise<number> {
    const numProps = await this.auctionsService.latestNumProps(dto);
    if (numProps === undefined)
      throw new HttpException(
        `Error fetching num props for ${dto.auctionId} `,
        HttpStatus.NOT_FOUND,
      );
    return Number(numProps);
  }

  @Get('latestNumVotes/:n')
  async latestNumVotes(@Query() dto: LatestDto): Promise<number> {
    const numVotes = await this.auctionsService.latestNumVotes(dto);
    if (numVotes === undefined)
      throw new HttpException(
        `Error fetching num props for ${dto.auctionId} `,
        HttpStatus.NOT_FOUND,
      );
    return Number(numVotes);
  }
}
