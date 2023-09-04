import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Langs } from './langs.entity';
import { LangService } from './langs.service';
// import { CreateAdminDto, UserType } from './admin.types';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import config from '../config/configuration';
import { promises } from 'dns';

@Controller('langs')
export class LangController {
  [x: string]: any;

  constructor(private readonly langService: LangService) {}

  @Get('/list')
//   @ApiOkResponse({
//     type: [Langs],
//   })
  getAll(): Promise<Langs[]> {
    return this.langService.findAll();
  }


  @Get('/defaultsForCreation')
  @ApiOkResponse({
    type: [Object],
  })
  async getLangsForDefault(): Promise<Object>  {
     // 1: round title，2: round content，3: proposal title, 4: proposal content
    const ids = [1,2,3,4];

    const records = await this.langService.searchByIds(ids);

    const results = {
        roundTitle: records[0].content,
        roundContent: records[1].content,
        proposalTitle: records[2].content,
        proposalContent: records[3].content,
    };

    return results;
  }

}
