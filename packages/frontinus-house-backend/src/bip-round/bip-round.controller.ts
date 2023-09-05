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
  import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';
import { BipOptionService } from 'src/bip-option/bip-option.service';
import { BipRoundService } from './bip-round.service';
import { CreateBipRoundDto, GetBipRoundDto } from './bip-round.types';
import { BipOption } from 'src/bip-option/bip-option.entity';
  
  @Controller('bip-round')
  export class BipRoundController {
    [x: string]: any;
  
    constructor(
      private readonly bipRoundService: BipRoundService,
      private readonly bipOptionService: BipOptionService,
      private readonly adminService: AdminService,
    ) {}
  
    @Get('/list')
    @ApiOkResponse({
      type: [BipRound],
    })
    getAll(@Query() dto: GetBipRoundDto): Promise<BipRound[]> {
      return this.bipRoundService.findAll(dto);
    }

    @Post('/create')
    @ApiOkResponse({
      type: BipRound,
    })
    async createForCommunity(
      @Body(SignedPayloadValidationPipe) dto: CreateBipRoundDto,
    ): Promise<BipRound> {

      // verifySignPayload(dto, [
      //   'startTime',
      //   'endTime',
      //   'title',
      //   'description',
      // ]);

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
    async getDetail(@Param('id', ParseIntPipe) id: number): Promise<BipRound> {

      const roundRecord = await this.bipRoundService.findOne(id);

      // Add vote percentage for "Vote Results":
      let totalVoteCount = 0;
      roundRecord.bipOptions.forEach(option => {
        totalVoteCount += option.voteCount;
      });

      roundRecord.bipOptions.forEach(option => {
        option.percentage = this.roundUpNumberToString(option.voteCount, totalVoteCount);
        // option.percentage = this.roundUpNumber(option.voteCount / totalVoteCount * 100);
        // option.percentage = Math.round( option.voteCount / totalVoteCount * 100 * 1e2 ) / 1e2;
      });

      // roundRecord.quorum = parseInt(process.env.BIP_VOTE_QUORUM); // Fix number 1500, ask Yao
      roundRecord.quorum = 1500; // Fix number 1500, ask Yao
      // roundRecord.quorumPercentage = this.roundUpNumber(totalVoteCount / 1500);
      // roundRecord.quorumPercentage = (totalVoteCount / 1500).toFixed(2);
      roundRecord.quorumPercentage = this.roundUpNumberToString(totalVoteCount, 1500);
      
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
}
  