import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {
  verifySignPayload,
  verifySignPayloadForBipVote,
} from '../utils/verifySignedPayload';
import {
  BipVote,
  convertBipVoteListToDelegateVoteList,
} from './bip-vote.entity'; //   import {
//     DelegatedVoteDto,
//     DeleteVoteDto,
//     VotingPower,
//   } from './vote.types';
import { BipVoteService } from './bip-vote.service';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger/dist/decorators/api-response.decorator';
import {
  CreateBipVoteDto,
  DelegatedBipVoteDto,
  DeleteVoteDto,
} from './bip-vote.types';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { CommunitiesService } from 'src/community/community.service';
import { VotingPower } from '../vote/vote.types';
import { ApiQuery } from '@nestjs/swagger';

@Controller('bip-votes')
export class BipVoteController {
  constructor(
    private readonly bipVotesService: BipVoteService,
    private readonly bipRoundService: BipRoundService,
    private readonly bipOptionService: BipOptionService,
    private readonly blockchainService: BlockchainService,
    private readonly communitiesService: CommunitiesService,
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
    verifySignPayloadForBipVote(createVoteDto);

    const foundOption = await this.bipOptionService.findOne(
      createVoteDto.bipOptionId,
    );

    // Verify that proposal exist
    if (!foundOption) {
      throw new HttpException('No Option with that ID', HttpStatus.NOT_FOUND);
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

    const community = await this.communitiesService.findOne(
      foundRound.communityId,
    );

    const vp = await this.blockchainService.getVotingPowerWithSnapshot(
      createVoteDto.address,
      // process.env.COMMUNITY_ADDRESS,
      community.contractAddress,
      foundRound.balanceBlockTag,
    );
    // const vp = 1;

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
        // process.env.COMMUNITY_ADDRESS,
        community.contractAddress,
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

    await this.bipRoundService.updateBipRoundVoteCount(foundRound);

    return convertBipVoteListToDelegateVoteList(voteResultList);
  }

  @ApiOperation({
    summary: 'Remove bip vote',
    description:
      'At the same time, it will remove the votes of others that it delegated.',
  })
  @ApiResponse({
    status: 200,
    description: 'The vote has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @Post('/remove')
  async deleteOne(
    @Body(SignedPayloadValidationPipe) deleteVoteDto: DeleteVoteDto,
  ): Promise<boolean> {
    verifySignPayload(deleteVoteDto, ['bipRoundId']);

    let foundVote;
    if (deleteVoteDto.bipRoundId) {
      foundVote = await this.bipVotesService.findOne({
        where: {
          address: deleteVoteDto.address,
          bipRoundId: deleteVoteDto.bipRoundId,
        },
      });
    } else {
      throw new HttpException('Missing bipRoundId', HttpStatus.BAD_REQUEST);
    }

    if (!foundVote) {
      throw new HttpException('No Vote with that ID', HttpStatus.NOT_FOUND);
    }

    if (
      foundVote.address.toLowerCase() !== deleteVoteDto.address.toLowerCase()
    ) {
      throw new HttpException(
        'Can not cancel this Vote',
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundBIP = await this.bipRoundService.findOne(foundVote.bipRoundId);
    // Should never happen ( Unless Chao manually modifies the database )
    // if (!foundProposal) {
    //   throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    // }
    const currentTime = new Date();
    if (currentTime > foundBIP.endTime) {
      throw new HttpException('BIP had been ended.', HttpStatus.BAD_REQUEST);
    }
    if (foundVote.delegateId && foundVote.delegateId > 0) {
      throw new HttpException(
        'Unable to undo votes delegated by others.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start remove vote:
    const ids = [foundVote.id];
    const delegateVoteList = await this.bipVotesService.findAll({
      where: {
        bipRoundId: foundVote.bipRoundId,
        delegateAddress: foundVote.address,
      },
    });
    
    if (delegateVoteList.length > 0) {
      ids.push(...delegateVoteList.map((v) => v.id));
    }

    await this.bipVotesService.removeMany(ids);
    await this.bipRoundService.rollupVoteCount(foundVote);

    return true;
  }

  @Get('votingPower')
  @ApiOperation({
    summary:
      'Get voting power for an address at the block height corresponding to the proposalId',
  })
  @ApiOkResponse({
    type: VotingPower,
  })
  @ApiBadRequestResponse({
    description:
      'If delegate is true and the current queried address has been delegated to another address, then return an exception.',
  })
  @ApiQuery({
    name: 'address',
    description: 'Address for which to get the voting power',
    type: String,
  })
  @ApiQuery({
    name: 'bipOptionId',
    type: Number,
  })
  @ApiQuery({
    name: 'delegate',
    description:
      'Whether to query based on delegate relationships. If true, it will query the voting power of other addresses delegated to the current address; if the current address delegates to other addresses, an error will be thrown. Otherwise, only query based on the on-chain state.',
    type: Boolean,
    required: false,
  })
  async getVotingPower(
    @Query('address') address: string,
    @Query('bipOptionId') bipOptionId: number,
    @Query('delegate') delegate: boolean,
  ): Promise<VotingPower> {
    if (!bipOptionId) {
      throw new HttpException(
        'No bip option with that ID',
        HttpStatus.NOT_FOUND,
      );
    }

    const bipOption = await this.bipOptionService.findOne(bipOptionId);
    if (!bipOption) {
      throw new HttpException(
        'No bip option with that ID',
        HttpStatus.NOT_FOUND,
      );
    }
    return this.bipVotesService.getVotingPower(
      address,
      bipOption.bipRound,
      delegate,
    );
  }
}
