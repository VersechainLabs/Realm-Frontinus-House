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

import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { CreateBipCommentDto, GetBipCommentsDto, Order, UpdateBipCommentDto } from './bip-comment.types';
import { BipCommentsService } from './bip-comment.service';
import { BipComment } from './bip-comment.entity';
import { HttpModule, HttpService } from '@nestjs/axios';
import { BipRoundService } from 'src/bip-round/bip-round.service';
import { ethers } from 'ethers';
import { AxiosModule } from 'src/http-service/axios.module';
import { AxiosService, PostToDiscordTypes } from 'src/http-service/axios.service';


@Controller('bip-comments')
export class BipCommentsController {
  [x: string]: any;

  constructor(
    private readonly commentsService: BipCommentsService,
    private readonly bipRoundService: BipRoundService,
    private readonly axiosService: AxiosService,
    private readonly httpService: HttpService) {}

    @Get('/test/test')
    async test (
      @Query('address') ethereumAddress?: string,
    ) {
      const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_URL);

      let ensName = await provider.lookupAddress(ethereumAddress);

      console.log("ethereumAddress:", ethereumAddress);
      let ensAvatar = await provider.getAvatar(ethereumAddress);
      console.log("ensAvatar:", ensAvatar);

      return ensName + ' ' + ensAvatar;



      // test webhook:
      const bipRound = await this.bipRoundService.findOne(17);

      const contentMaxLetter = 150;
      let shortContent = this.removeTags(bipRound.content);
      const contentLeng = shortContent.length;

      if (shortContent.length > contentMaxLetter) {
        shortContent = shortContent.substring(0, contentMaxLetter) + "...";
      }

      const params = {
        username: '0xBd0d064094780CbCb5B33dA22B2BbA9A39fBD90E',
        avatar_url: "https://frontinus.house/bulb.png",
        content:  `0xBd0d064094780CbCb5B33dA22B2BbA9A39fBD90E replied in ${bipRound.title} \n
        https://frontinus.house/bip/${bipRound.id}`,
        embeds: [
          {
            "title": `${bipRound.title}`,
            "color": 15258703,
            "thumbnail": {
              "url": "https://frontinus.house/bulb.png",
            },
            "fields": [
              {
                "name": ``,
                "value": shortContent,
                "inline": true
              }
            ]
          }
        ]
      }
      this.httpService.post(process.env.DISCORD_WEBHOOK_COMMENT, params)
       .subscribe(
        response => console.log(response),
        error => console.log(error)
      );
    }


  @Post('/create')
  @ApiOkResponse({
    type: BipComment,
  })
  async create(
    @Body(SignedPayloadValidationPipe)
    createCommentDto: CreateBipCommentDto,
  ): Promise<BipComment> {
    const bipRound = await this.bipRoundService.findOne(createCommentDto.bipRoundId);

    this.axiosService.postBipToDiscord(createCommentDto.address, bipRound, PostToDiscordTypes.COMMENT);

    return await this.commentsService.createComment(createCommentDto);
  }

  @Patch('/edit')
  @ApiOkResponse({
    type: BipComment,
  })
  async update(
    @Body(SignedPayloadValidationPipe)
    dto: UpdateBipCommentDto,
  ): Promise<BipComment> {
    verifySignPayload(dto, ['id']);

    return await this.commentsService.updateComment(dto);
  }

  @Get('/byBipRound/:bipRoundId')
  @ApiOkResponse({
    type: [BipComment],
  })
  @ApiQuery({
    name: 'skip',
    description: 'Start from which result.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'How many results to return.',
    type: Number,
    required: false,
  })
  @ApiQuery({
    name: 'order',
    description: 'Search results in Desc or Asc order',
    enum: Order,
    required: false,
  })
  async findByProposal(
    @Param('bipRoundId', ParseIntPipe) bipRoundId: number,
    @Query() dto: GetBipCommentsDto,
  ): Promise<BipComment[]> {
    const comments = await this.commentsService.findByProposal(bipRoundId, dto);
    if (!comments)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comments;
  }

  @Get('/byApplication/:applicationId')
  @ApiOkResponse({
    type: [BipComment],
  })
  async findByApplication(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Query() dto: GetBipCommentsDto,
  ): Promise<BipComment[]> {
    const comments = await this.commentsService.findByApplication(
      applicationId,
      dto,
    );
    if (!comments)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comments;
  }
}
  