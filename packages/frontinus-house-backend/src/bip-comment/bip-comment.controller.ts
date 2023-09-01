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
  
  @Controller('bip-comments')
  export class BipCommentsController {
    [x: string]: any;
  
    constructor(private readonly commentsService: BipCommentsService) {}
  
    @Post('/create')
    @ApiOkResponse({
      type: BipComment,
    })
    async create(
      @Body(SignedPayloadValidationPipe)
      createCommentDto: CreateBipCommentDto,
    ): Promise<BipComment> {
      return await this.commentsService.createComment(createCommentDto);
    }
  
    @Patch()
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
  
    @Get('/byProposal/:proposalId')
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
      @Param('proposalId', ParseIntPipe) proposalId: number,
      @Query() dto: GetBipCommentsDto,
    ): Promise<BipComment[]> {
      const comments = await this.commentsService.findByProposal(proposalId, dto);
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
  