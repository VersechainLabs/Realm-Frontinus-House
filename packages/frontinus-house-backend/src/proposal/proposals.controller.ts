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
import { AuctionsService } from 'src/auction/auctions.service';
import { ECDSASignedPayloadValidationPipe } from 'src/entities/ecdsa-signed.pipe';
import { canSubmitProposals } from 'src/utils';
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
import getProposalByIdResponse from 'examples/getProposalById.json';
import { VotesService } from '../vote/votes.service';

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
      await this.checkCanVote(foundProposal, userAddress);
    }

    return foundProposal;
  }

  @Delete()
  async delete(
    @Body(ECDSASignedPayloadValidationPipe)
    deleteProposalDto: DeleteProposalDto,
  ) {
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

    // Check that signed payload and body have same proposal ID
    const signedPayload = JSON.parse(
      Buffer.from(deleteProposalDto.signedData.message, 'base64').toString(),
    );

    if (signedPayload.id !== deleteProposalDto.id)
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    if (deleteProposalDto.address !== foundProposal.address)
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    return await this.proposalsService.remove(deleteProposalDto.id);
  }

  @Patch()
  async update(
    @Body(ECDSASignedPayloadValidationPipe)
    updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal> {
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

    // Verify that signed data equals this payload
    const signedPayload = JSON.parse(
      Buffer.from(updateProposalDto.signedData.message, 'base64').toString(),
    );

    if (
      !(
        signedPayload.what === updateProposalDto.what &&
        signedPayload.tldr === updateProposalDto.tldr &&
        signedPayload.title === updateProposalDto.title &&
        signedPayload.parentAuctionId === updateProposalDto.parentAuctionId &&
        signedPayload.id === updateProposalDto.id
      )
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
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
        'You cannot edit proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signed data equals this payload
    const signedPayload = JSON.parse(
      Buffer.from(createProposalDto.signedData.message, 'base64').toString(),
    );

    if (
      !(
        signedPayload.what === createProposalDto.what &&
        signedPayload.tldr === createProposalDto.tldr &&
        signedPayload.title === createProposalDto.title &&
        signedPayload.parentAuctionId === createProposalDto.parentAuctionId
      )
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    const proposal = new Proposal();
    proposal.address = createProposalDto.address;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.title = createProposalDto.title;
    proposal.auction = foundAuction;
    proposal.createdDate = new Date();

    return this.proposalsService.store(proposal);
  }

  async checkCanVote(foundProposal: Proposal, userAddress: string) {
    try {
      if (foundProposal.votes) {
        for (const vote of foundProposal.votes) {
          if (vote.address === userAddress) {
            foundProposal.canVote = false;
            foundProposal.disallowedVoteReason =
              'You have voted for this proposal';
            return;
          }
        }
      }

      await this.voteService.checkEligibleToVote(
        foundProposal,
        foundProposal.auction,
        userAddress,
        true,
      );

      foundProposal.canVote = true;
    } catch (e) {
      if (e instanceof HttpException) {
        foundProposal.canVote = false;
        foundProposal.disallowedVoteReason = e.message;
      } else {
        console.log(e);
      }
    }
  }
}
