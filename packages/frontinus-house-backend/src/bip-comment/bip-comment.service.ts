import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Proposal } from '../proposal/proposal.entity';
import { Application } from '../delegation-application/application.entity';
import { updateValidFields } from '../utils';
import { CreateBipCommentDto, GetBipCommentsDto, UpdateBipCommentDto } from './bip-comment.types';
import { BipOption } from 'src/bip-option/bip-option.entity';
import { BipComment } from './bip-comment.entity';
import { BipRound } from 'src/bip-round/bip-round.entity';

@Injectable()
export class BipCommentsService {
  constructor(
    @InjectRepository(BipComment) private commentsRepository: Repository<BipComment>,
    @InjectRepository(BipRound)
    private bipRoundRepository: Repository<BipRound>,
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  async findByProposal(
    bipRoundId: number,
    dto: GetBipCommentsDto,
  ): Promise<BipComment[]> {
    return await this.commentsRepository.find({
      where: { bipRoundId },
      take: dto.limit,
      skip: dto.skip,
      order: { id: dto.order },
    });
  }

  async findByApplication(
    applicationId: number,
    dto: GetBipCommentsDto,
  ): Promise<BipComment[]> {
    return await this.commentsRepository.find({
      where: { applicationId },
      take: dto.limit,
      skip: dto.skip,
      order: { id: dto.order },
    });
  }

  async store(data: BipComment): Promise<BipComment> {
    return await this.commentsRepository.save(data, { reload: true });
  }

  // Chao
  async createComment(createCommentDetails: CreateBipCommentDto) {
    // Validate params
    const currentDate = new Date();
    if (createCommentDetails.bipRoundId > 0) {
      const bipRound = await this.bipRoundRepository.findOne(
        createCommentDetails.bipRoundId,
        { 
            // relations: ['bipRound'], 
            where: { visible: true } 
        },
      );

      if (!bipRound) {
        throw new HttpException(
          'Bip round not found. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (currentDate > bipRound.endTime) {
        throw new HttpException(
          'Round has been closed. Cannot create comment',
          HttpStatus.BAD_REQUEST,
        );
      }
      bipRound.commentCount++;
      await this.bipRoundRepository.save(bipRound);
    } 
    // else if (createCommentDetails.applicationId > 0) {
    //   const application = await this.applicationRepository.findOne(
    //     createCommentDetails.applicationId,
    //     { relations: ['delegation'], where: { visible: true } },
    //   );
    //   if (!application) {
    //     throw new HttpException(
    //       'Application not found. Cannot create comment',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    //   if (currentDate > application.delegation.endTime) {
    //     throw new HttpException(
    //       'Delegation has been closed. Cannot create comment',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }

    //   application.commentCount++;
    //   await this.applicationRepository.save(application);
    // } else {
    //   throw new HttpException(
    //     'At least one of the following properties must be non-empty: proposalId, applicationId',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // Create
    const newRecord = this.commentsRepository.create({
      ...createCommentDetails,
    });
    return await this.commentsRepository.save(newRecord);
  }

  async updateComment(dto: UpdateBipCommentDto): Promise<BipComment> {
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
    if (foundComment.bipRoundId > 0) {
      const proposal = await this.bipRoundRepository.findOne(
        foundComment.bipRoundId,
        { 
            // relations: ['auction'], 
            where: { visible: true } 
        },
      );

      if (currentDate > proposal.endTime) {
        throw new HttpException(
          'Round has been closed. Cannot update comment',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    // else if (foundComment.applicationId > 0) {
    //   const application = await this.applicationRepository.findOne(
    //     foundComment.applicationId,
    //     { relations: ['delegation'], where: { visible: true } },
    //   );
    //   if (currentDate > application.delegation.endTime) {
    //     throw new HttpException(
    //       'Delegation has been closed. Cannot update comment',
    //       HttpStatus.BAD_REQUEST,
    //     );
    //   }
    // }

    // Create
    updateValidFields(foundComment, dto, ['content']);
    return await this.commentsRepository.save(foundComment);
  }
}
