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
import { ProposalsService } from 'src/proposal/proposals.service';
import { Order } from 'src/utils/dto-types';
import { ECDSAPersonalSignedPayloadValidationPipe } from '../entities/ecdsa-personal-signed.pipe';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('comments')
export class CommentsController {
  [x: string]: any;
  constructor(
    private readonly commentsService: CommentsService,
    private readonly proposalService: ProposalsService,
  ) {}

  @Get()
  @ApiOkResponse({
    type: [Comment],
  })
  getAll(): Promise<Comment[]> {
    return this.commentsService.findAll();
  }

  @Post('/create')
  @ApiOkResponse({
    type: Comment,
  })
  async create(
    @Body(ECDSAPersonalSignedPayloadValidationPipe)
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
    @Query('limit') limit: number,
    @Query('skip') skip: number,
    @Query('order') order: Order,
    @Body() dto: GetCommentsDto,
  ): Promise<Comment[]> {
    dto.limit = limit;
    dto.skip = skip;
    dto.order = Order[order.toUpperCase()]; // support lowercase "asc" | "desc"

    const comments = await this.commentsService.findByProposal(proposalId, dto);
    if (!comments)
      throw new HttpException('Comment not found', HttpStatus.NOT_FOUND);
    return comments;
  }
}
