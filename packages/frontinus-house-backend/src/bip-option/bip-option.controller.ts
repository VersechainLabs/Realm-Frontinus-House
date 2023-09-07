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
  import { BipOptionService } from './bip-option.service';
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
import { BipVoteService } from 'src/bip-vote/bip-vote.service';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { CreateBipOptionDto, GetBipOptionsDto } from './bip-option.types';
  
  @Controller('bip-option')
  export class BipOptionController {
    constructor(
      private readonly bipRoundService: BipRoundService,
      private readonly bipOptionService: BipOptionService,
      private readonly bipVoteService: BipVoteService,
      private readonly blockchainService: BlockchainService,
    ) {}


    @Post('/create')
    @ApiOkResponse({
      type: BipOption,
    })
    async create(
      @Body(ECDSASignedPayloadValidationPipe)
      dto: CreateBipOptionDto,
    ): Promise<BipOption> {
      verifySignPayload(dto, [
        'description',
        'optionType',
        'parentBipRoundId',
      ]);
  
      const foundAuction = await this.bipRoundService.findOne(
        dto.parentBipRoundId,
      );
      if (!foundAuction)
        throw new HttpException(
          'No round with that ID exists',
          HttpStatus.NOT_FOUND,
        );
  
  
      // Do create:
      const proposal = new BipOption();
      proposal.address = dto.address;
      proposal.description = dto.description;
      proposal.optionType = dto.optionType;
      // proposal.title = dto.title;
      proposal.bipRound = foundAuction;
      proposal.createdDate = new Date();
      // proposal.previewImage = dto.previewImage;
  
      return this.bipOptionService.store(proposal);
    }

    @Get('/list')
    @ApiOkResponse({
      type: [BipOption],
    })
    async getBipOptionsByBipRoundId(@Query('bipRoundId') bipRoundId: number): Promise<BipOption[]> {
      return this.bipOptionService.findAllWithBipRoundId(bipRoundId);
    }
  
  }
  