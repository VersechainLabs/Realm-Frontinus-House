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
import { ProposalsService } from '../proposal/proposals.service';
import {
  verifySignPayload,
  verifySignPayloadForVote,
} from '../utils/verifySignedPayload';
import { convertVoteListToDelegateVoteList, Vote } from './vote.entity';
import {
  CreateVoteDto,
  DelegatedVoteDto,
  DeleteVoteDto,
  GetVoteDto,
  VotingPower,
} from './vote.types';
import { VotesService } from './votes.service';
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

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
    private readonly auctionService: AuctionsService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get()
  getVotes(): Promise<Vote[]> {
    return this.votesService.findAll();
  }

  @Get('findWithOpts')
  getVotesWithOpts(@Query() dto: GetVoteDto): Promise<Vote[]> {
    return this.votesService.findAllWithOpts(dto);
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
    name: 'proposalId',
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
    @Query('proposalId') proposalId: number,
    @Query('delegate') delegate: boolean,
  ): Promise<VotingPower> {
    const foundProposal = await this.proposalService.findOne(proposalId);
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }
    const foundProposalAuction = await this.auctionService.findOneWithCommunity(
      foundProposal.auctionId,
    );
    if (!foundProposalAuction) {
      throw new HttpException('No auction with that ID', HttpStatus.NOT_FOUND);
    }
    return this.votesService.getVotingPower(
      address,
      foundProposalAuction,
      delegate,
    );
  }

  @Get('by/:address')
  findByAddress(@Param('address') address: string) {
    return this.votesService.findByAddress(address);
  }

  @Get('numVotes/:account/:roundId')
  numVotesCasted(
    @Param('account') account: string,
    @Param('roundId') roundId: number,
  ) {
    return this.votesService.getNumVotesByAccountAndRoundId(account, roundId);
  }

  @Get('byCommunities/:addresses')
  findByCommunity(@Param('addresses') addresses: string) {
    const votes = this.votesService.findAllByCommunityAddresses(
      addresses.split(','),
    );
    if (!votes)
      throw new HttpException('Votes not found', HttpStatus.NOT_FOUND);
    return votes;
  }

  @Get('getVotingEligibility')
  async isEligibleToVote(
    proposalId: number,
    address: string,
  ): Promise<boolean> {
    const foundProposal = await this.proposalService.findOne(proposalId);
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }
    const foundProposalAuction = await this.auctionService.findOneWithCommunity(
      foundProposal.auctionId,
    );
    if (!foundProposalAuction) {
      throw new HttpException('No auction with that ID', HttpStatus.NOT_FOUND);
    }

    return await this.votesService.checkEligibleToVote(
      foundProposal,
      foundProposalAuction,
      address,
    );
  }

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
  @Post()
  @ApiOperation({ summary: 'Create vote' })
  @ApiResponse({
    status: 201,
    description: 'The vote has been successfully created.',
    type: [Vote],
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async create(
    @Body(SignedPayloadValidationPipe) createVoteDto: CreateVoteDto,
  ): Promise<Vote[]> {
    verifySignPayloadForVote(createVoteDto);

    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );
    // Verify that proposal exist
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }

    const foundAuction = foundProposal.auction;
    await this.votesService.checkEligibleToVote(
      foundProposal,
      foundAuction,
      createVoteDto.address,
      false,
    );

    const delegateList = await this.votesService.getDelegateListByAuction(
      createVoteDto.address,
      foundAuction,
    );

    const voteList: DelegatedVoteDto[] = [];
    const vp = await this.votesService.getVotingPowerByBlockNum(
      createVoteDto.address,
      foundAuction.balanceBlockTag,
    );
    voteList.push({
      ...createVoteDto,
      delegateId: null,
      delegate: null,
      blockHeight: foundAuction.balanceBlockTag,
      weight: vp,
      actualWeight: vp,
    } as DelegatedVoteDto);
    for (const delegate of delegateList) {
      const vp = await this.votesService.getVotingPowerByBlockNum(
        delegate.fromAddress,
        foundAuction.balanceBlockTag,
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
        blockHeight: foundAuction.balanceBlockTag,
        weight: 0, //  weight is 0 because they are delegated by other.
        actualWeight: vp,
      } as DelegatedVoteDto);
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

    const voteResultList = await this.votesService.createNewVoteList(
      voteList,
      foundProposal,
    );

    await this.proposalService.rollupVoteCount(foundProposal.id);

    return convertVoteListToDelegateVoteList(voteResultList);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Vote> {
    return this.votesService.findOne(id);
  }

  @Delete()
  async deleteOne(
    @Body(SignedPayloadValidationPipe) deleteVoteDto: DeleteVoteDto,
  ): Promise<boolean> {
    verifySignPayload(deleteVoteDto, ['id']);

    const foundVote = await this.votesService.findOne(deleteVoteDto.id);
    if (!foundVote) {
      throw new HttpException('No Vote with that ID', HttpStatus.NOT_FOUND);
    }
    if (
      foundVote.address.toLowerCase() !== deleteVoteDto.address.toLowerCase()
    ) {
      throw new HttpException(
        'Can not unapproved this Vote',
        HttpStatus.NOT_FOUND,
      );
    }

    const foundProposal = await this.proposalService.findOne(
      foundVote.proposalId,
    );
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }
    const currentTime = new Date();
    if (currentTime > foundProposal.auction.votingEndTime) {
      throw new HttpException('Round had been ended.', HttpStatus.BAD_REQUEST);
    }
    if (foundVote.delegateId && foundVote.delegateId > 0) {
      throw new HttpException(
        'Unable to undo votes delegated by others.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start remove vote.
    const ids = [deleteVoteDto.id];
    const delegateVoteList = await this.votesService.findAll({
      where: {
        proposalId: foundVote.proposalId,
        delegateAddress: foundVote.address,
      },
    });
    if (delegateVoteList.length > 0) {
      ids.push(...delegateVoteList.map((v) => v.id));
    }
    await this.votesService.removeMany(ids);
    await this.proposalService.rollupVoteCount(foundProposal.id);
    return true;
  }
}
