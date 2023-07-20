import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { Comment } from './comment.entity';
import { CreateCommentDto, GetCommentsDto } from './comment.types';
import { CommentsService } from './comments.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Order } from 'src/utils/dto-types';
import { ECDSAPersonalSignedPayloadValidationPipe } from '../entities/ecdsa-personal-signed.pipe';

@Controller('comments')
  export class CommentsController {
    [x: string]: any;
    constructor(
      private readonly commentsService: CommentsService,
      private readonly proposalService: ProposalsService,
    ) {}
  
    @Get()
    getAll(): Promise<Comment[]> {
      return this.commentsService.findAll(); 
    }
  

    @Post('/create')
    async create(@Body(ECDSAPersonalSignedPayloadValidationPipe) createCommentDto: CreateCommentDto): Promise<Comment> {
        return await this.commentsService.createComment(createCommentDto);
    }
  

    @Get('/byProposal/:proposalId')
    async findByProposal(
      @Param('proposalId') proposalId: number, 
      @Query('limit') limit: number, 
      @Query('skip') skip: number, 
      @Query('order') order: Order,         
      @Body() dto: GetCommentsDto
    ) {
      dto.limit = limit;
      dto.skip = skip;
      dto.order = Order[order.toUpperCase()]; // support lowercase "asc" | "desc"

      const comments = await this.commentsService.findByProposal(proposalId, dto);
      if (!comments)
        throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
      return comments;
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