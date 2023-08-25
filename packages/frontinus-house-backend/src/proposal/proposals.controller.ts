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
import { Auction } from '../auction/auction.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Community } from '../community/community.entity';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ApiQuery } from '@nestjs/swagger';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
    private readonly voteService: VotesService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  @Get()
  getProposals(@Query() dto: GetProposalsDto): Promise<Proposal[]> {
    return this.proposalsService.findAll(dto);
  }

  @Get('/canCreate')
  @ApiOkResponse({
    type: ApplicationCreateStatus,
  })
  async check(
    @Query('auctionId') auctionId: number,
    @Query('address') address: string,
  ): Promise<ApplicationCreateStatus> {
    const foundAuction = await this.auctionsService.findOne(auctionId);
    if (!foundAuction) {
      throw new HttpException(
        'Auction not found. Cannot create proposal',
        HttpStatus.NOT_FOUND,
      );
    }

    return this.checkCanCreateProposal(foundAuction, address);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find proposal by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Proposal ID' })
  @ApiQuery({
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
    @Param('id', ParseIntPipe) id: number,
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
    const updateKeys = ['what', 'tldr', 'title', 'previewImage'];
    verifySignPayload(updateProposalDto, ['id', ...updateKeys]);

    const foundProposal = await this.proposalsService.findOne(
      updateProposalDto.id,
    );
    if (!foundProposal)
      throw new HttpException(
        'No proposal with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(foundProposal.auction))
      throw new HttpException(
        'You cannot edit proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    if (updateProposalDto.address !== foundProposal.address)
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    updateValidFields(foundProposal, updateProposalDto, updateKeys);
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

    const canCreateStatus = await this.checkCanCreateProposal(
      foundAuction,
      createProposalDto.address,
    );
    if (canCreateStatus.code !== ProposalCreateStatusMap.OK.code) {
      throw new HttpException(canCreateStatus.message, HttpStatus.BAD_REQUEST);
    }

    // var matches = createProposalDto.what.match(/\bhttps?:\/\/\S+\"/gi);

    // Do create:
    const proposal = new Proposal();
    proposal.address = createProposalDto.address;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.title = createProposalDto.title;
    proposal.auction = foundAuction;
    proposal.createdDate = new Date();
    proposal.previewImage = createProposalDto.previewImage;

    // if (Array.isArray(matches) && matches.length > 0) {
    //   console.log("matches[0: ", matches[0]);
    //   const cleanImageUrl = matches[0].replace(/\"$/, '');
    //   console.log("cleanImageUrl: ", cleanImageUrl);

    //   proposal.previewImage = cleanImageUrl;
    // }

    return this.proposalsService.store(proposal);
  }

  async checkCanCreateProposal(
    auction: Auction,
    address: string,
  ): Promise<ApplicationCreateStatus> {
    const auctionId = auction.id;
    const currentDate = new Date();
    if (
      currentDate < auction.startTime ||
      currentDate > auction.proposalEndTime
    ) {
      return ProposalCreateStatusMap.WRONG_PERIOD;
    }

    if (auction.visibleStatus !== AuctionVisibleStatus.NORMAL) {
      return ProposalCreateStatusMap.NOT_APPROVE;
    }

    // Same Proposal must NOT exists:
    const existingProposal = await this.proposalsService.findBy({
      where: { auctionId: auctionId, address: address },
    });

    if (existingProposal) {
      return ProposalCreateStatusMap.CREATED;
    }

    // Can not create proposal if he already vote to another user.
    const existingVote = await this.voteService.findOneBy({
      where: { auctionId: auctionId, address: address },
    });
    if (existingVote) {
      return ProposalCreateStatusMap.DELEGATE_TO_OTHER;
    }

    // Long: Create Proposal don't need Realms NFT:
    // const community = await this.communitiesRepository.findOne(1);
    // // Check voting power
    // const vp = await this.blockchainService.getVotingPowerWithSnapshot(
    //   address,
    //   community.contractAddress,
    // );
    // if (vp <= 0) {
    //   return ProposalCreateStatusMap.NO_VOTING_POWER;
    // }

    return ProposalCreateStatusMap.OK;
  }

  /**
   * Add canVote|disallowedVoteReason|stateCode to proposal entity.
   * @param foundProposal
   * @param userAddress
   * @returns
   */
  async addVoteState(foundProposal: Proposal, userAddress: string) {
    if (foundProposal.votes) {
      // Check if the current user has voted in this proposal, and if so, the frontend needs to display the "Delete Vote" button.
      // The back-end does not need that state. The back-end can vote repeatedly on the same proposal to increase its weight.
      for (const vote of foundProposal.votes) {
        if (vote.address === userAddress) {
          foundProposal.voteState = VoteStates.VOTED;
          return;
        }
      }
    }

    const checkVoteState = await this.voteService.checkEligibleToVote(
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
