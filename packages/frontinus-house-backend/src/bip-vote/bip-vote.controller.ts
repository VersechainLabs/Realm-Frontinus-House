import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    Query,
  } from '@nestjs/common';
  import { ProposalsService } from '../proposal/proposals.service';
  import {
    verifySignPayload,
    verifySignPayloadForVote,
  } from '../utils/verifySignedPayload';
  import { convertVoteListToDelegateVoteList, BipVote } from './bip-vote.entity';
//   import {
//     CreateVoteDto,
//     DelegatedVoteDto,
//     DeleteVoteDto,
//     VotingPower,
//   } from './vote.types';
  import { BipVoteService } from './bip-vote.service';
  import { AuctionsService } from '../auction/auctions.service';
  import { BlockchainService } from '../blockchain/blockchain.service';
  import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
  import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
  import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiResponse,
  } from '@nestjs/swagger/dist/decorators/api-response.decorator';
  import { ApiQuery } from '@nestjs/swagger/dist/decorators/api-query.decorator';
  import { Delete } from '@nestjs/common/decorators/http/request-mapping.decorator';
  
  @Controller('bipVotes')
  export class BipVoteController {
    constructor(
      private readonly votesService: BipVoteService,
      private readonly auctionService: AuctionsService,
      private readonly blockchainService: BlockchainService,
    ) {}
  
  }