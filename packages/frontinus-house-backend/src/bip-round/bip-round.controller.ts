import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
  } from '@nestjs/common';
  import { BipRound } from './bip-round.entity';
  import { ProposalsService } from '../proposal/proposals.service';
  import { Proposal } from '../proposal/proposal.entity';
  import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
  import { ApiParam } from '@nestjs/swagger/dist/decorators/api-param.decorator';
  import {
    ApiNotFoundResponse,
    ApiOkResponse,
  } from '@nestjs/swagger/dist/decorators/api-response.decorator';
  import { AdminService } from '../admin/admin.service';
  import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
  import { verifySignPayload } from '../utils/verifySignedPayload';
  import { AuctionVisibleStatus, VoteStates } from '@nouns/frontinus-house-wrapper';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { BipRoundService } from './bip-round.service';
import { CreateBipRoundDto, GetBipRoundDto } from './bip-round.types';
import { BipOption } from 'src/bip-option/bip-option.entity';
import { VotingPeriod } from 'src/auction/auction.types';
import { BipVoteService } from 'src/bip-vote/bip-vote.service';
  
  @Controller('bip-round')
  export class BipRoundController {
    [x: string]: any;
  
    constructor(
      private readonly bipRoundService: BipRoundService,
      private readonly bipOptionService: BipOptionService,
      private readonly bipVoteService: BipVoteService,
      private readonly adminService: AdminService,
    ) {}
  
    @Get('/list')
    @ApiOkResponse({
      type: [BipRound],
    })
    async getAll(@Query() dto: GetBipRoundDto): Promise<BipRound[]> {
      const roundList = await this.bipRoundService.findAll(dto);

      // Add voting period:
      roundList.forEach(bipRound => {
        if (new Date() < bipRound.startTime) bipRound.votingPeriod = VotingPeriod.NOT_START;
        else if (new Date() > bipRound.endTime) bipRound.votingPeriod = VotingPeriod.END;
        else bipRound.votingPeriod = VotingPeriod.VOTING;
      });

      return roundList;
    }


    @Get('/forCommunity/:id')
    async findAllForCommunity(
      @Param('id', ParseIntPipe) id: number,
    ): Promise<BipRound[]> {
      const bipRounds = await this.bipRoundService.findAllForCommunityByVisible(
        id,
      );
      if (!bipRounds)
        throw new HttpException('Bip Auction not found', HttpStatus.NOT_FOUND);
      // auctions.map((a) => (a.numProposals = Number(a.numProposals) || 0));
      return bipRounds;
    }




    @Post('/create')
    @ApiOkResponse({
      type: BipRound,
    })
    async createForCommunity(
      @Body(SignedPayloadValidationPipe) dto: CreateBipRoundDto,
    ): Promise<BipRound> {

      verifySignPayload(dto, [
        'startTime',
        'endTime',
        'title',
        'description',
      ]);

      const newRound = await this.bipRoundService.createBipRound(
        dto,
      );

      dto.options.forEach(async (optionDesc) => {
        const proposal = new BipOption();
        proposal.address = dto.address;
        proposal.description = optionDesc;
        proposal.optionType = dto.optionType;
        proposal.bipRound = newRound;
        proposal.createdDate = new Date();
    
        await this.bipOptionService.store(proposal);
      });

      return newRound;
    }    

    @Get('/detail/:id')
    @ApiOkResponse({
      type: [BipRound],
    })
    async getDetail(
      @Param('id', ParseIntPipe) id: number, 
      @Query('address') userAddress: string
      ): Promise<BipRound> {
      const roundRecord = await this.bipRoundService.findOne(id);

      // Add vote percentage for "Vote Results":
      let totalVoteCount = 0;
      roundRecord.bipOptions.forEach(option => {
        totalVoteCount += option.voteCount;
      });

      roundRecord.bipOptions.forEach(option => {
        option.percentage = this.roundUpNumberToString(option.voteCount, totalVoteCount);
      });

      roundRecord.quorum = 1500; // Fix number 1500, ask Yao
      roundRecord.quorumPercentage = this.roundUpNumberToString(totalVoteCount, 1500);
      
      // Sort options by create-date:
      roundRecord.bipOptions.sort(function(a, b) {
        var keyA = new Date(a.createdDate),
          keyB = new Date(b.createdDate);
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });

      // Add voteState:
      await this.addVoteState(roundRecord, userAddress);

      // Add current user voted option:
      const voteHistory = await this.bipVoteService.findOneByRound(roundRecord.id, userAddress);
      if (voteHistory) 
        roundRecord.currentUserVotedOptionId = voteHistory.bipOptionId;
      else 
      roundRecord.currentUserVotedOptionId = 0; // not voted in this round yet

      return roundRecord;
    }



    // e.g: 42.008 => 42.01
    roundUpNumber(val: number):number {
      return Math.round( val * 1e2 ) / 1e2;
    }
    roundUpNumberToString(count: number, total: number):string {
      if (total == 0) return "0.00"; // otherwise it will return "NaN"

      return (count / total * 100).toFixed(2);
    }

  /**
   * Add canVote|disallowedVoteReason|stateCode to proposal entity.
   * @param foundProposal
   * @param userAddress
   * @returns
   */
  async addVoteState(foundRound: BipRound, userAddress: string) {
    if (foundRound.bipVotes) {
      // Check if the current user has voted in this proposal, and if so, the frontend needs to display the "Delete Vote" button.
      // The back-end does not need that state. The back-end can vote repeatedly on the same proposal to increase its weight.
      for (const vote of foundRound.bipVotes) {
        if (vote.address === userAddress) {
          // "delegated vote" has same record as normal vote in db, only diff is extra delegateId & delegateAddress field
          if (vote.delegateId) {
            foundRound.voteState = VoteStates.ALREADY_DELEGATED;
            return;
          }
          else {
            foundRound.voteState = VoteStates.VOTED;
            return;
          }
        }
      }
    }

    const checkVoteState = await this.bipVoteService.checkEligibleToBipVote(
      foundRound,
      userAddress,
      true,
    );

    if (checkVoteState) {
      foundRound.voteState = checkVoteState;
      return;
    }

    foundRound.voteState = VoteStates.OK;
  }

}
  