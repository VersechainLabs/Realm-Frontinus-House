import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
  } from '@nestjs/common';
  import { AuctionsService } from '../auction/auctions.service';
  import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
  import { canSubmitProposals, updateValidFields } from '../utils';
  import {
    ApplicationCreateStatus,
    AuctionVisibleStatus,
    ProposalCreateStatusMap,
    VoteStates,
  } from '@nouns/frontinus-house-wrapper';
  import { BipOption } from './bip-option.entity';
  import { BipService } from './bip-option.service';
  import {
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiResponse,
  } from '@nestjs/swagger/dist/decorators/api-response.decorator';
  import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
  import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
  import getProposalByIdResponse from '../../examples/getProposalById.json';
  import { VotesService } from '../vote/votes.service';
  import { verifySignPayload } from '../utils/verifySignedPayload';
  import { Auction } from '../auction/auction.entity';
  import { Repository } from 'typeorm';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Community } from '../community/community.entity';
  import { BlockchainService } from '../blockchain/blockchain.service';
  
  @Controller('bip-option')
  export class BipOptionController {
    constructor(
      private readonly bipService: BipService,
      private readonly voteService: VotesService,
      private readonly blockchainService: BlockchainService,
      @InjectRepository(Community)
      private communitiesRepository: Repository<Community>,
    ) {}
  
    // @Get()
    // getProposals(@Query() dto: GetProposalsDto): Promise<Proposal[]> {
    //   return this.proposalsService.findAll(dto);
    // }
  
  }
  