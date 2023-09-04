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
import { Comment } from './comment.entity';
import {
  CreateCommentDto,
  GetCommentsDto,
  Order,
  UpdateCommentDto,
} from './comment.types';
import { CommentsService } from './comments.service';
import { ApiOkResponse, ApiQuery } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';

@Controller('comments')
export class CommentsController {
  [x: string]: any;

  constructor(private readonly commentsService: CommentsService) {}

  @Post('/create')
  @ApiOkResponse({
    type: Comment,
  })
  async create(
    @Body(SignedPayloadValidationPipe)
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return await this.commentsService.createComment(createCommentDto);
  }

  @Patch()
  @ApiOkResponse({
    type: Comment,
  })
  async update(
    @Body(SignedPayloadValidationPipe)
    dto: UpdateCommentDto,
  ): Promise<Comment> {
    verifySignPayload(dto, ['id']);

    return await this.commentsService.updateComment(dto);
  }

  @Get('/byProposal/:proposalId')
  @ApiOkResponse({
    type: [Comment],
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
    @Query() dto: GetCommentsDto,
  ): Promise<Comment[]> {
    const comments = await this.commentsService.findByProposal(proposalId, dto);
    if (!comments)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comments;
  }

  @Get('/byApplication/:applicationId')
  @ApiOkResponse({
    type: [Comment],
  })
  async findByApplication(
    @Param('applicationId', ParseIntPipe) applicationId: number,
    @Query() dto: GetCommentsDto,
  ): Promise<Comment[]> {
    const comments = await this.commentsService.findByApplication(
      applicationId,
      dto,
    );
    if (!comments)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comments;
  }
}
