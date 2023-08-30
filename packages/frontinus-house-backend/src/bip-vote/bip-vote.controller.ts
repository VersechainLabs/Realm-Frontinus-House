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
import { CreateBipVoteDto } from './bip-vote.types';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BipOptionService } from 'src/bip-option/bip-option.service';
  
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
    // @Post('/create')
    // @ApiOperation({ summary: 'Create vote' })
    // @ApiResponse({
    //   status: 201,
    //   description: 'The vote has been successfully created.',
    //   type: [BipVote],
    // })
    // @ApiResponse({ status: 400, description: 'Bad request.' })
    // async create(
    //   @Body(SignedPayloadValidationPipe) createVoteDto: CreateBipVoteDto,
    // ): Promise<BipVote[]> {
    //   // verifySignPayloadForVote(createVoteDto);

    //   const foundProposal = await this.bipOptionService.findOne(
    //     createVoteDto.bipOptionId,
    //   );
    //   // Verify that proposal exist
    //   if (!foundProposal) {
    //     throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    //   }

    //   const foundAuction = foundProposal.auction;
    //   await this.bipVotesService.checkEligibleToVote(
    //     foundProposal,
    //     foundAuction,
    //     createVoteDto.address,
    //     false,
    //   );

    //   const delegateList = await this.votesService.getDelegateListByAuction(
    //     createVoteDto.address,
    //     foundAuction,
    //   );

    //   const voteList: DelegatedVoteDto[] = [];
    //   const vp = await this.blockchainService.getVotingPowerWithSnapshot(
    //     createVoteDto.address,
    //     foundAuction.community.contractAddress,
    //     foundAuction.balanceBlockTag,
    //   );
    //   voteList.push({
    //     ...createVoteDto,
    //     delegateId: null,
    //     delegate: null,
    //     blockHeight: foundAuction.balanceBlockTag,
    //     weight: vp,
    //     actualWeight: vp,
    //   } as DelegatedVoteDto);
    //   for (const delegate of delegateList) {
    //     const vp = await this.blockchainService.getVotingPowerWithSnapshot(
    //       delegate.fromAddress,
    //       foundAuction.community.contractAddress,
    //       foundAuction.balanceBlockTag,
    //     );
    //     if (vp === 0) {
    //       // vp is 0, don't record it.
    //       continue;
    //     }
    //     voteList.push({
    //       ...createVoteDto,
    //       address: delegate.fromAddress,
    //       delegateId: delegate.id,
    //       delegateAddress: delegate.toAddress,
    //       delegate: delegate,
    //       blockHeight: foundAuction.balanceBlockTag,
    //       weight: 0, //  weight is 0 because they are delegated by other.
    //       actualWeight: vp,
    //     } as DelegatedVoteDto);
    //   }

    //   // Verify that signer has voting power
    //   const votingPower = voteList.reduce(
    //     (acc, vote) => acc + vote.actualWeight,
    //     0,
    //   );

    //   if (votingPower === 0) {
    //     throw new HttpException(
    //       'Signer does not have voting power',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   } else {
    //     voteList[0].weight = votingPower;
    //   }

    //   const voteResultList = await this.votesService.createNewVoteList(
    //     voteList,
    //     foundProposal,
    //   );

    //   await this.proposalService.rollupVoteCount(foundProposal.id);

    //   return convertVoteListToDelegateVoteList(voteResultList);
    // }
  }