import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './comment.entity';
import { CreateCommentDto, GetCommentsDto } from './comment.types';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import { Application } from '../delegation-application/application.entity';
import { Delegation } from '../delegation/delegation.entity';

// export type AuctionWithProposalCount = Comment & { numProposals: number };

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepository: Repository<Comment>,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
    @InjectRepository(Auction) private auctionsRepository: Repository<Auction>,
    @InjectRepository(Proposal)
    private proposalsRepository: Repository<Proposal>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
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
      if (currentDate > application.delegation.votingEndTime) {
        throw new HttpException(
          'Delegation has been closed. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
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
}
