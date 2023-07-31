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

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
  ) {}

  @Get()
  getProposals(@Query() dto: GetProposalsDto): Promise<Proposal[]> {
    return this.proposalsService.findAll(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find proposal by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Proposal ID' })
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
  async findOne(@Param('id') id: number): Promise<Proposal> {
    const foundProposal = await this.proposalsService.findOne(id);
    if (!foundProposal)
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
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
    foundProposal.signatureState = updateProposalDto.signatureState;
    foundProposal.what = updateProposalDto.what;
    foundProposal.tldr = updateProposalDto.tldr;
    foundProposal.title = updateProposalDto.title;
    foundProposal.signedData = updateProposalDto.signedData;
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
    proposal.signatureState = createProposalDto.signatureState;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.title = createProposalDto.title;
    proposal.signedData = createProposalDto.signedData;
    proposal.auction = foundAuction;
    proposal.messageTypes = createProposalDto.messageTypes;
    proposal.domainSeparator = createProposalDto.domainSeparator;
    proposal.createdDate = new Date();

    return this.proposalsService.store(proposal);
  }
}
