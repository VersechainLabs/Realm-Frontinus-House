import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuctionsService } from '../auction/auctions.service';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
import { VoteStates, canSubmitProposals } from '../utils';
import { Proposal } from './proposal.entity';
import {
  CreateProposalDto,
  DeleteProposalDto,
  GetProposalsDto,
  UpdateProposalDto,
} from './proposal.types';
import { ProposalsService } from './proposals.service';
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
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
    private readonly voteService: VotesService,
  ) {}

  @Get()
  getProposals(@Query() dto: GetProposalsDto): Promise<Proposal[]> {
    return this.proposalsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find proposal by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Proposal ID' })
  @ApiParam({
    name: 'address',
    type: String,
    description:
      "Current logged-in user's address, if available, also check if they can vote on this proposal.",
    required: false,
  })
  @ApiOkResponse({
    description: 'Proposal found and returned successfully',
    type: Proposal,
  })
  @ApiResponse({
    description: 'example',
    schema: {
      type: 'Proposal',
      example: getProposalByIdResponse,
    },
  })
  @ApiNotFoundResponse({ description: 'Proposal not found' })
  async findOne(
    @Param('id') id: number,
    @Query('address') userAddress: string,
  ): Promise<Proposal> {
    const foundProposal = await this.proposalsService.findOne(id);
    if (!foundProposal)
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);

    if (userAddress && userAddress.length > 0) {
      await this.addVoteState(foundProposal, userAddress);
    }

    return foundProposal;
  }

  @Delete()
  async delete(
    @Body(ECDSASignedPayloadValidationPipe)
    deleteProposalDto: DeleteProposalDto,
  ) {
    verifySignPayload(deleteProposalDto, ['id']);
    const foundProposal = await this.proposalsService.findOne(
      deleteProposalDto.id,
    );

    if (!foundProposal)
      throw new HttpException(
        'No proposal with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(await foundProposal.auction))
      throw new HttpException(
        'You cannot delete proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    if (deleteProposalDto.address !== foundProposal.address) {
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );
    }

    return await this.proposalsService.remove(deleteProposalDto.id);
  }

  @Patch()
  async update(
    @Body(ECDSASignedPayloadValidationPipe)
    updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal> {
    verifySignPayload(updateProposalDto, [
      'what',
      'tldr',
      'title',
      'parentAuctionId',
      'id',
    ]);

    const foundProposal = await this.proposalsService.findOne(
      updateProposalDto.id,
    );
    if (!foundProposal)
      throw new HttpException(
        'No proposal with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(await foundProposal.auction))
      throw new HttpException(
        'You cannot edit proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    if (updateProposalDto.address !== foundProposal.address)
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    foundProposal.address = updateProposalDto.address;
    foundProposal.what = updateProposalDto.what;
    foundProposal.tldr = updateProposalDto.tldr;
    foundProposal.title = updateProposalDto.title;
    foundProposal.reqAmount = updateProposalDto.reqAmount
      ? updateProposalDto.reqAmount
      : null;
    return this.proposalsService.store(foundProposal);
  }

  @Post()
  @ApiOkResponse({
    type: Proposal,
  })
  async create(
    @Body(ECDSASignedPayloadValidationPipe)
    createProposalDto: CreateProposalDto,
  ): Promise<Proposal> {
    verifySignPayload(createProposalDto, [
      'what',
      'tldr',
      'title',
      'parentAuctionId',
    ]);

    const foundAuction = await this.auctionsService.findOne(
      createProposalDto.parentAuctionId,
    );
    if (!foundAuction)
      throw new HttpException(
        'No auction with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(foundAuction))
      throw new HttpException(
        'You cannot create proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    if (foundAuction.visibleStatus === AuctionVisibleStatus.PENDING) {
      throw new HttpException(
        'You cannot create proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );
    }

    const proposal = new Proposal();
    proposal.address = createProposalDto.address;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.title = createProposalDto.title;
    proposal.auction = foundAuction;
    proposal.createdDate = new Date();

    return this.proposalsService.store(proposal);
  }

  /**
   * Add canVote|disallowedVoteReason|stateCode to proposal entity.
   * @param foundProposal 
   * @param userAddress 
   * @returns 
   */
  async addVoteState(foundProposal: Proposal, userAddress: string) {
    if (foundProposal.votes) {
      for (const vote of foundProposal.votes) {
        if (vote.address === userAddress) {
          foundProposal.voteState = VoteStates.VOTED;
          return;
        }
      }
    }

    let checkVoteState = await this.voteService.checkEligibleToVoteNew(
      foundProposal,
      foundProposal.auction,
      userAddress,
      true,
    );
    if (checkVoteState) {
      foundProposal.voteState = checkVoteState;
      return;
    }

    foundProposal.voteState = VoteStates.OK;
  }
}
