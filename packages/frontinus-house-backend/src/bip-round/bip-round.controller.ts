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
import { CreateBipRoundDto } from './bip-round.types';
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
    getAll(): Promise<BipRound[]> {
      return this.bipRoundService.findAll();
    }

    @Post('/create')
    @ApiOkResponse({
      type: BipRound,
    })
    async createForCommunity(
      @Body(SignedPayloadValidationPipe) dto: CreateBipRoundDto,
    ): Promise<BipRound> {

      // var obj2 = JSON.parse(dto.options);
      // console.log(dto.options);

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

}
  