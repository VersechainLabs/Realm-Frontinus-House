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


@Controller('bip-comments')
export class BipCommentsController {
  [x: string]: any;

  constructor(
    private readonly commentsService: BipCommentsService,
    private readonly bipRoundService: BipRoundService,
    private readonly httpService: HttpService) {}

    @Get('/test/test')
    async test (
    ) {
      const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_URL);

      const ethereumAddress = '0x26bD';
      let ensName = await provider.lookupAddress(ethereumAddress);

      console.log("ethereumAddress:", ethereumAddress);
      let ensAvatar = await provider.getAvatar(ethereumAddress);
      console.log("ensAvatar:", ensAvatar);

      return ensName + ' ' + ensAvatar;






      const bipRound = await this.bipRoundService.findOne(17);

      const contentMaxLetter = 150;
      let shortContent = this.removeTags(bipRound.content);
      const contentLeng = shortContent.length;

      if (shortContent.length > contentMaxLetter) {
        shortContent = shortContent.substring(0, contentMaxLetter) + "...";
      }

      const params = {
        username: '0xa55aE31783B8398f4585dA6cde3EE42F7f88a7F6',
        avatar_url: "https://frontinus.house/bulb.png",
        content:  `0xa55aE31783B8398f4585dA6cde3EE42F7f88a7F6 replied in ${bipRound.title} \n
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
      this.httpService.post(process.env.DISCORD_WEBHOOK, params)
       .subscribe(
        response => console.log(response),
        error => console.log(error)
      );



      // this.httpService.get('http://localhost:3001/admins/list')
      // .subscribe(
      //   response => console.log(response.data),
      //   error => console.log(error)
      // );
    
      
      // const params = {
      //   username: "Chao",
      //   avatar_url: "https://frontinus.house/bulb.png",
      //   content: "Chao message: https://frontinus.house/bip/9",
      //   embeds: [
      //     {
      //       "title": "Chao title",
      //       "color": 15258703,
      //       "thumbnail": {
      //         "url": "https://frontinus.house/bulb.png",
      //       },
      //       "fields": [
      //         {
      //           "name": "Chao bip fields here",
      //           "value": "Chao Whatever you wish to send",
      //           "inline": true
      //         }
      //       ]
      //     }
      //   ]
      // }
      // this.httpService.post(process.env.DISCORD_WEBHOOK, params)
      //  .subscribe(
      //   response => console.log(response),
      //   error => console.log(error)
      // );



      // this.httpService.post('https://discord.com/api/webhooks/1179769731264295013/dqNOlVAVOjnxd6S1f2jVNbwHfRAAqIrLe_FCW0L-W9wMl37wL-Hbri2gNjK8CpQA8IWW', params)
      //  .subscribe(
      //   response => console.log(response),
      //   error => console.log(error)
      // );


      // await fetch('https://discord.com/api/webhooks/1179769731264295013/dqNOlVAVOjnxd6S1f2jVNbwHfRAAqIrLe_FCW0L-W9wMl37wL-Hbri2gNjK8CpQA8IWW', {
      //   method: "POST",
      //   headers: {
      //     'Content-type': 'application/json'
      //   },
      //   body: JSON.stringify(params)
      // }).then(res => {
      //   console.log(1111,res);
      // })


      // try {
      //   const response = await this.httpService.get('http://localhost:3001/admins/list');
      //   console.log(response);
      // } catch (error) {
      //   console.error(error);
      // }


      // try {
      //   const response = await this.httpService.get('http://localhost:3001/admins/list').pipe(map((res) => res.data));
      //   console.log(response);
      // } catch (error) {
      //   console.error(error);
      // }


    }

  removeTags(str) {
      if ((str===null) || (str===''))
          return false;
      else
          str = str.toString();
           
      // Regular expression to identify HTML tags in
      // the input string. Replacing the identified
      // HTML tag with a null string.
      return str.replace( /(<([^>]+)>)/ig, '');
  }

  @Post('/create')
  @ApiOkResponse({
    type: BipComment,
  })
  async create(
    @Body(SignedPayloadValidationPipe)
    createCommentDto: CreateBipCommentDto,
  ): Promise<BipComment> {

    console.log("enter bip-commnet/create");

    const bipRound = await this.bipRoundService.findOne(createCommentDto.bipRoundId);

    const contentMaxLetter = 150;
    let shortContent = this.removeTags(bipRound.content);
    const contentLeng = shortContent.length;
    if (shortContent.length > contentMaxLetter) {
      shortContent = shortContent.substring(0, contentMaxLetter) + "...";
    }

    // 用户没有用户名就显示address，没有头像就显示frontinus house的logo:
    const provider = new ethers.providers.JsonRpcProvider(process.env.WEB3_RPC_URL);
    console.log("address: ", createCommentDto.address);
    // ens name:
    let ensName = await provider.lookupAddress(createCommentDto.address);
    console.log("ensName: ", ensName);
    if (ensName == null) {
      // turn "0x9d7bA953587B8adffdaqweqwe09Ea489F026bD" into "0x9d7...26bD" for better look:
      ensName = createCommentDto.address.substring(0, 5) + "..." + createCommentDto.address.substring(createCommentDto.address.length - 4);
    }
    // ens avatar:
    let ensAvatar = await provider.getAvatar(createCommentDto.address);
    ensAvatar = ensAvatar == null ? "https://frontinus.house/bulb.png" : ensAvatar;

    const params = {
      username: ensName,
      avatar_url: ensAvatar,
      content:  `${ensName} replied in ${bipRound.title} \n https://frontinus.house/bip/${bipRound.id}`,
      embeds: [
        {
          "title": `${bipRound.title}`,
          "color": 15258703,
          "thumbnail": {
            // "url": "https://frontinus.house/bulb.png",
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

    console.log("params:", params);

    this.httpService.post(process.env.DISCORD_WEBHOOK, params)
     .subscribe(
      response => console.log(response),
      error => console.log(error)
    );

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
  