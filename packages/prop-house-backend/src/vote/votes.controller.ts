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
import { convertVoteListToDelegateVoteList, Vote } from './vote.entity';
import {
  CreateVoteDto,
  DelegatedVoteDto,
  GetVoteDto,
  VotingPower,
} from './vote.types';
import { VotesService } from './votes.service';
import { AuctionsService } from 'src/auction/auctions.service';
import { SignatureState } from 'src/types/signature';
import { BlockchainService } from '../blockchain/blockchain.service';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';

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
  async getVotingPower(
    @Query('address') address: string,
    @Query('proposalId') proposalId: number,
    @Query('delegate') delegate: boolean,
  ) {
    const foundProposal = await this.proposalService.findOne(proposalId);
    const foundProposalAuction = await this.auctionService.findOneWithCommunity(
      foundProposal.auctionId,
    );

    let votingPower = await this.blockchainService.getVotingPower(
      address,
      foundProposalAuction.community.contractAddress,
      foundProposalAuction.balanceBlockTag,
    );

    const result = {
      address: address,
      weight: votingPower,
      actualWeight: votingPower,
      blockNum: foundProposalAuction.balanceBlockTag,
    } as VotingPower;

    if (delegate) {
      const delegateList = await this.votesService.getDelegateListByAuction(
        address,
        foundProposalAuction,
      );

      if (delegateList.length > 0) {
        result.delegateList = [];
      }
      const _blockchainService = this.blockchainService;
      votingPower = await delegateList.reduce(
        async (prevVotingPower, currentDelegate) => {
          const currentVotingPower = await _blockchainService.getVotingPower(
            currentDelegate.fromAddress,
            foundProposalAuction.community.contractAddress,
            foundProposalAuction.balanceBlockTag,
          );

          result.delegateList.push({
            address: currentDelegate.fromAddress,
            weight: 0,
            actualWeight: currentVotingPower,
            blockNum: foundProposalAuction.balanceBlockTag,
          } as VotingPower);

          return (await prevVotingPower) + currentVotingPower;
        },
        Promise.resolve(votingPower),
      );
      result.weight = votingPower;
    }

    return result;
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
    @Body(SignedPayloadValidationPipe) createVoteDto: CreateVoteDto,
  ) {
    verifySignPayloadForVote(createVoteDto);

    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );
    // Verify that proposal exist
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }

    const foundAuction = foundProposal.auction;

    // Check if user has voted for this round, Protect against casting same vote twice
    const sameAuctionVote = await this.votesService.findBy(
      foundAuction.id,
      createVoteDto.address,
    );
    if (sameAuctionVote) {
      throw new HttpException(
        `Vote for prop ${foundProposal.id} failed because user has already been voted in this auction`,
        HttpStatus.FORBIDDEN,
      );
    }

    const delegateList = await this.votesService.getDelegateListByAuction(
      createVoteDto.address,
      foundAuction,
    );

    const voteList: DelegatedVoteDto[] = [];
    voteList.push({
      ...createVoteDto,
      delegateId: null,
      delegate: null,
      blockHeight: foundAuction.balanceBlockTag,
      weight: await this.votesService.getVotingPower(
        createVoteDto.address,
        foundAuction.balanceBlockTag,
      ),
    } as DelegatedVoteDto);
    for (const delegate of delegateList) {
      const vp = await this.votesService.getVotingPower(
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
        weight: vp,
        actualWeight: 0, // actual weight is 0 because they are delegated by other.
      } as DelegatedVoteDto);
    }

    // Verify that signer has voting power
    const votingPower = voteList.reduce((acc, vote) => acc + vote.weight, 0);

    if (votingPower === 0) {
      throw new HttpException(
        'Signer does not have voting power',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      voteList[0].actualWeight = votingPower;
    }

    const voteResultList = await this.votesService.createNewVoteList(
      voteList,
      foundProposal,
    );

    await this.proposalService.rollupVoteCount(foundProposal.id);

    return convertVoteListToDelegateVoteList(voteResultList);
  }
}
