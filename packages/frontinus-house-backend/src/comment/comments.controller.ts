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
import { Comment } from './comment.entity';
import { CreateCommentDto, GetCommentsDto } from './comment.types';
import { CommentsService } from './comments.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';

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

  @Get('/byProposal/:proposalId')
  @ApiOkResponse({
    type: [Comment],
  })
  async findByProposal(
    @Param('proposalId') proposalId: number,
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
    @Param('applicationId') applicationId: number,
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
