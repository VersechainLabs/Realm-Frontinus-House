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
    // verifySignPayloadForVote,
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
import { CreateBipVoteDto, DelegatedBipVoteDto } from './bip-vote.types';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { DelegatedVoteDto } from 'src/vote/vote.types';
  
  @Controller('bipVotes')
  export class BipVoteController {
    constructor(
      private readonly bipVotesService: BipVoteService,
      private readonly bipRoundService: BipRoundService,
      private readonly bipOptionService: BipOptionService,
      private readonly blockchainService: BlockchainService,
    ) {}
  
    /**
     * Checks:
     * - signature is valid via `SignedPayloadValidationPipe`
     * - proposal being voted on exists
     * - signature matches dto
     * - proposal being voted for matches signed vote community address
     * - signer has voting power for signed vote
     * - casting vote does not exceed > voting power
     * @param createVoteDto
     */
    @Post('/create')
    @ApiOperation({ summary: 'Create vote' })
    @ApiResponse({
      status: 201,
      description: 'The vote has been successfully created.',
      type: [BipVote],
    })
    @ApiResponse({ status: 400, description: 'Bad request.' })
    async create(
      @Body(SignedPayloadValidationPipe) createVoteDto: CreateBipVoteDto,
    ): Promise<BipVote[]> {
      // verifySignPayloadForVote(createVoteDto);

      const foundOption = await this.bipOptionService.findOne(
        createVoteDto.bipOptionId,
      );
      // Verify that proposal exist
      if (!foundOption) {
        throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
      }

      const foundRound = foundOption.bipRound;
      await this.bipVotesService.checkEligibleToVote(
        foundOption,
        foundRound,
        createVoteDto.address,
        false,
      );

      const delegateList = await this.bipVotesService.getDelegateListByAuction(
        createVoteDto.address,
        foundRound,
      );

      const voteList: DelegatedBipVoteDto[] = [];
      const vp = await this.blockchainService.getVotingPowerWithSnapshot(
        createVoteDto.address,
        process.env.COMMUNITY_ADDRESS,
        foundRound.balanceBlockTag,
      );
      voteList.push({
        ...createVoteDto,
        delegateId: null,
        delegate: null,
        blockHeight: foundRound.balanceBlockTag,
        weight: vp,
        actualWeight: vp,
      } as DelegatedBipVoteDto);
      for (const delegate of delegateList) {
        const vp = await this.blockchainService.getVotingPowerWithSnapshot(
          delegate.fromAddress,
          process.env.COMMUNITY_ADDRESS,
          foundRound.balanceBlockTag,
        );
        if (vp === 0) {
          // vp is 0, don't record it.
          continue;
        }
        voteList.push({
          ...createVoteDto,
          address: delegate.fromAddress,
          delegateId: delegate.id,
          delegateAddress: delegate.toAddress,
          delegate: delegate,
          blockHeight: foundRound.balanceBlockTag,
          weight: 0, //  weight is 0 because they are delegated by other.
          actualWeight: vp,
        } as DelegatedBipVoteDto);
      }

      // Verify that signer has voting power
      const votingPower = voteList.reduce(
        (acc, vote) => acc + vote.actualWeight,
        0,
      );

      if (votingPower === 0) {
        throw new HttpException(
          'Signer does not have voting power',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        voteList[0].weight = votingPower;
      }

      const voteResultList = await this.bipVotesService.createNewVoteList(
        voteList,
        foundOption,
      );

      await this.bipOptionService.rollupVoteCount(foundOption.id);

      return convertVoteListToDelegateVoteList(voteResultList);
    }
  }