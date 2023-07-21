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
import { ProposalsService } from 'src/proposal/proposals.service';
import { verifySignPayloadForVote } from 'src/utils/verifySignedPayload';
import { Vote } from './vote.entity';
import { CreateVoteDto, DelegatedVoteDto, GetVoteDto } from './vote.types';
import { VotesService } from './votes.service';
import { AuctionsService } from 'src/auction/auctions.service';
import { SignatureState } from 'src/types/signature';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { Delegate } from '../delegate/delegate.entity';
import { DelegationState } from '../delegation/delegation.types';

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
    private readonly auctionService: AuctionsService,
    private readonly blockchainService: BlockchainService,
    private readonly delegationService: DelegationService,
    private readonly delegateService: DelegateService,
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
  async getVotingPower(
    @Query('address') address: string,
    @Query('proposalId') proposalId: number,
  ) {
    const foundProposal = await this.proposalService.findOne(proposalId);
    const foundProposalAuction = await this.auctionService.findOneWithCommunity(
      foundProposal.auctionId,
    );

    return this.blockchainService.getVotingPower(
      address,
      foundProposalAuction.community.contractAddress,
      foundProposalAuction.balanceBlockTag,
    );
    // Sample:
    // return getVotingPower(
    //   address,
    //   '0x7AFe30cB3E53dba6801aa0EA647A0EcEA7cBe18d',
    //   this.provider,
    //   17665090,
    // );
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Vote> {
    return this.votesService.findOne(id);
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
  async create(
    // @Body(SignedPayloadValidationPipe)
    @Body()
    createVoteDto: CreateVoteDto,
  ) {
    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );
    // Verify that proposal exist
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }

    const foundAuction = foundProposal.auction;

    // Verify signed payload against dto
    const voteFromPayload = verifySignPayloadForVote(
      createVoteDto,
      foundProposal,
    );

    // Check if user has voted for this round, Protect against casting same vote twice
    const sameAuctionVote = await this.votesService.findBy(
      foundAuction.id,
      createVoteDto.address,
    );
    if (sameAuctionVote)
      throw new HttpException(
        `Vote for prop ${foundProposal.id} failed because user has already been voted in this auction`,
        HttpStatus.FORBIDDEN,
      );

    // Check if user has delegated to other user.
    const currentDelegationList = await this.delegationService.findByState(
      DelegationState.ACTIVE,
    );
    const currentDelegation =
      currentDelegationList.length > 0 ? currentDelegationList[0] : null;
    if (currentDelegation) {
      const fromDelegate = await this.delegateService.findByFromAddress(
        currentDelegation.id,
        createVoteDto.address,
      );
      if (fromDelegate) {
        throw new HttpException(
          `Vote for prop ${foundProposal.id} failed because user has already been delegated for other user`,
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Get delegate list for calculate voting power
    const delegateList: Delegate[] = [];
    if (currentDelegation) {
      delegateList.push(
        ...(await this.delegateService.getDelegateListByAddress(
          currentDelegation.id,
          createVoteDto.address,
        )),
      );
    }

    const voteList: DelegatedVoteDto[] = [];
    voteList.push({
      ...createVoteDto,
      delegateId: null,
      delegate: null,
      votingPower: await this.votesService.getVotingPower(
        createVoteDto.address,
        foundAuction.balanceBlockTag,
      ),
    } as DelegatedVoteDto);
    for (const delegate of delegateList) {
      voteList.push({
        ...createVoteDto,
        address: delegate.fromAddress,
        delegateId: delegate.id,
        delegate: delegate,
        votingPower: await this.votesService.getVotingPower(
          delegate.fromAddress,
          foundAuction.balanceBlockTag,
        ),
      } as DelegatedVoteDto);
    }

    // Verify that signer has voting power
    const votingPower = voteList.reduce(
      (acc, vote) => acc + vote.votingPower,
      0,
    );

    if (votingPower === 0) {
      throw new HttpException(
        'Signer does not have voting power',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.votesService.createNewVoteList(voteList, foundProposal);

    // Only increase proposal vote count if the signature has been validated
    // TODO: don't know what is it
    if (createVoteDto.signatureState === SignatureState.VALIDATED) {
      await this.proposalService.rollupVoteCount(foundProposal.id);
    }
  }
}
