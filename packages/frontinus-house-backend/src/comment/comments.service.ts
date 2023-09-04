import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import {
  CreateCommentDto,
  GetCommentsDto,
  UpdateCommentDto,
} from './comment.types';
import { Proposal } from '../proposal/proposal.entity';
import { Application } from '../delegation-application/application.entity';
import { updateValidFields } from '../utils';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async findByProposal(
    proposalId: number,
    dto: GetCommentsDto,
  ): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { proposalId },
      take: dto.limit,
      skip: dto.skip,
      order: { id: dto.order },
    });
  }

  async findByApplication(
    applicationId: number,
    dto: GetCommentsDto,
  ): Promise<Comment[]> {
    return await this.commentsRepository.find({
      where: { applicationId },
      take: dto.limit,
      skip: dto.skip,
      order: { id: dto.order },
    });
  }

  async store(data: Comment): Promise<Comment> {
    return await this.commentsRepository.save(data, { reload: true });
  }

  // Chao
  async createComment(createCommentDetails: CreateCommentDto) {
    // Validate params
    const currentDate = new Date();
    if (createCommentDetails.proposalId > 0) {
      const proposal = await this.proposalsRepository.findOne(
        createCommentDetails.proposalId,
        { relations: ['auction'], where: { visible: true } },
      );

      if (!proposal) {
        throw new HttpException(
          'Proposal not found. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (currentDate > proposal.auction.votingEndTime) {
        throw new HttpException(
          'Round has been closed. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      proposal.commentCount++;
      await this.proposalsRepository.save(proposal);
    } else if (createCommentDetails.applicationId > 0) {
      const application = await this.applicationRepository.findOne(
        createCommentDetails.applicationId,
        { relations: ['delegation'], where: { visible: true } },
      );
      if (!application) {
        throw new HttpException(
          'Application not found. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (currentDate > application.delegation.endTime) {
        throw new HttpException(
          'Delegation has been closed. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }

      application.commentCount++;
      await this.applicationRepository.save(application);
    } else {
      throw new HttpException(
        'At least one of the following properties must be non-empty: proposalId, applicationId',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create
    const newRecord = this.commentsRepository.create({
      ...createCommentDetails,
    });
    return await this.commentsRepository.save(newRecord);
  }

  async updateComment(dto: UpdateCommentDto): Promise<Comment> {
    const foundComment = await this.commentsRepository.findOne(dto.id);
    if (!foundComment) {
      throw new HttpException(
        'No comment with that ID exists',
        HttpStatus.NOT_FOUND,
      );
    }

    if (foundComment.address != dto.address) {
      throw new HttpException(
        "Found comment does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );
    }

    // Validate params
    const currentDate = new Date();
    if (foundComment.proposalId > 0) {
      const proposal = await this.proposalsRepository.findOne(
        foundComment.proposalId,
        { relations: ['auction'], where: { visible: true } },
      );

      if (currentDate > proposal.auction.votingEndTime) {
        throw new HttpException(
          'Round has been closed. Cannot update comment',
          HttpStatus.BAD_REQUEST,
        );
      }
    } else if (foundComment.applicationId > 0) {
      const application = await this.applicationRepository.findOne(
        foundComment.applicationId,
        { relations: ['delegation'], where: { visible: true } },
      );
      if (currentDate > application.delegation.endTime) {
        throw new HttpException(
          'Delegation has been closed. Cannot update comment',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // Create
    updateValidFields(foundComment, dto, ['content']);
    return await this.commentsRepository.save(foundComment);
  }
}
