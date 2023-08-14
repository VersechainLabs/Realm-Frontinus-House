import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { Delegate } from './delegate.entity';
import { CreateDelegateDto, DeleteDelegateDto } from './delegate.types';
import { DelegateService } from './delegate.service';
import { ApplicationService } from '../delegation-application/application.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { Delete } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { APIResponses, APITransformer } from '../utils/error-codes';
import { VoteStates, VoteStatesClass } from '@nouns/frontinus-house-wrapper';
import { BlockchainService } from '../blockchain/blockchain.service';
import { Community } from '../community/community.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Controller('delegates')
export class DelegateController {
  [x: string]: any;

  constructor(
    private readonly delegateService: DelegateService,
    private readonly applicationService: ApplicationService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  @Post('/create')
  @ApiOkResponse({
    type: Delegate,
  })
  async create(
    @Body(SignedPayloadValidationPipe) dto: CreateDelegateDto,
  ): Promise<Delegate> {
    verifySignPayload(dto, ['applicationId']);

    const checkResult = await this.doDelegateCheck(
      dto.applicationId,
      dto.address,
    );

    if (checkResult !== VoteStates.OK) {
      throw new HttpException(checkResult.reason, HttpStatus.BAD_REQUEST);
    }

    const application = await this.applicationService.findOne(
      dto.applicationId,
    );

    const delegate = new Delegate();
    delegate.delegationId = application.delegationId;
    delegate.applicationId = dto.applicationId;
    delegate.fromAddress = dto.address;
    delegate.toAddress = application.address;
    const storedDelegate = await this.delegateService.store(delegate);

    await this.applicationService.updateDelegatorCount(application);
    return storedDelegate;
  }

  @Get('/checkExist')
  @ApiOkResponse({
    type: Boolean,
  })
  async checkDelegateExist(
    @Query('applicationId') applicationId: number,
    @Query('address') fromAddress: string,
  ) {
    const foundDelegate = await this.delegateService.checkDelegateExist(
      applicationId,
      fromAddress,
    );

    if (!foundDelegate) return false;
    return true;
  }

  @Get('/canVote')
  @ApiOkResponse({
    type: Boolean,
  })
  async checkDelegateCanVote(
    @Query('applicationId') applicationId: number,
    @Query('address') fromAddress: string,
  ): Promise<object> {
    const checkResult = await this.doDelegateCheck(applicationId, fromAddress);

    let application = await this.applicationService.findOne(applicationId);

    switch (checkResult) {
      case VoteStates.NO_APPLICATION:
        // 之前直接用的接口返回值。现在为了和Long那边返回值一致，加上voteState字段:
        const dummyApplication = { voteState: {} };
        dummyApplication.voteState = VoteStates.NO_APPLICATION;

        return APITransformer(
          APIResponses.DELEGATE.NO_APPLICATION,
          dummyApplication,
          `Can not find application ${applicationId}`,
        );
      case VoteStates.NOT_VOTING:
        application.voteState = VoteStates.NOT_DELEGATING;
        return APITransformer(APIResponses.DELEGATE.NOT_VOTING, application);
      case VoteStates.VOTED:
        application.voteState = VoteStates.VOTED; // Frontend : Show cancel btn
        return APITransformer(APIResponses.DELEGATE.DELEGATED, application);
      case VoteStates.DELEGATE_ANOTHER:
          application.voteState = VoteStates.DELEGATE_ANOTHER; // Frontend : Show words only
        return APITransformer(APIResponses.DELEGATE.DELEGATED, application);
      case VoteStates.APPLICATION_EXIST:
        application.voteState = VoteStates.APPLICATION_EXIST;
        return APITransformer(
          APIResponses.DELEGATE.APPLICATION_EXIST,
          application,
          `Already created application. Can not delegate to ${application.address}`,
        );
      case VoteStates.NO_POWER:
        application.voteState = VoteStates.NO_POWER;
        return APITransformer(APIResponses.DELEGATE.NO_POWER, application);
    }

    application.voteState = VoteStates.OK;
    return APITransformer(APIResponses.OK, application);
  }

  @Get('/list')
  @ApiOkResponse({
    type: [Delegate],
  })
  async listByApplicationID(
    @Query('applicationId') applicationId: number,
  ): Promise<object> {
    const foundDelegate =
      await this.delegateService.getDelegateListByApplicationId(applicationId);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    const results = {
      total: foundDelegate.length,
      delegates: foundDelegate,
    };

    return results;
  }

  @Get(':id')
  @ApiOkResponse({
    type: Delegate,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Delegate> {
    const foundDelegate = await this.delegateService.findOne(id);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    return foundDelegate;
  }

  @ApiOperation({
    summary: 'Remove delegate',
  })
  @ApiResponse({
    status: 200,
    description: 'The delegate has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @Delete()
  async deleteOne(
    @Body(SignedPayloadValidationPipe) deleteDelegateDto: DeleteDelegateDto,
  ): Promise<boolean> {
    verifySignPayload(deleteDelegateDto, ['id', 'applicationId']);

    let foundDelegate;
    if (deleteDelegateDto.id) {
      foundDelegate = await this.delegateService.findOne(deleteDelegateDto.id);
    } else if (deleteDelegateDto.applicationId) {
      foundDelegate = await this.delegateService.findOneBy({
        where: {
          fromAddress: deleteDelegateDto.address,
          applicationId: deleteDelegateDto.applicationId,
        },
      });
    } else {
      throw new HttpException(
        'Missing id or applicationId',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!foundDelegate) {
      throw new HttpException('No Delegate with that ID', HttpStatus.NOT_FOUND);
    }
    if (
      foundDelegate.fromAddress.toLowerCase() !==
      deleteDelegateDto.address.toLowerCase()
    ) {
      throw new HttpException(
        'Can not unapproved this delegate',
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundApplication = await this.applicationService.findOne(
      foundDelegate.applicationId,
    );
    const currentTime = new Date();
    if (currentTime > foundApplication.delegation.votingEndTime) {
      throw new HttpException(
        'Delegation round had been ended.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start remove delegate.
    await this.delegateService.remove(foundDelegate.id);
    return true;
  }

  async doDelegateCheck(
    applicationId: number,
    address: string,
  ): Promise<VoteStatesClass> {
    const application = await this.applicationService.findOne(applicationId);
    if (!application) {
      return VoteStates.NO_APPLICATION;
    }

    const currentTime = new Date();
    if (
      currentTime < application.delegation.proposalEndTime ||
      currentTime > application.delegation.votingEndTime
    ) {
      return VoteStates.NOT_VOTING;
    }

    const existDelegate = await this.delegateService.findByFromAddress(
      application.delegationId,
      address,
    );
    // Only 1 delagate is allowed in 1 delegation.
    if (existDelegate) {
      if (existDelegate.applicationId === applicationId)
        return VoteStates.VOTED;  // show cancel btn
      else
        return VoteStates.DELEGATE_ANOTHER; // show words only
    }

    const createdApplication = await this.applicationService.findByAddress(
      application.delegationId,
      address,
    );
    if (createdApplication) {
      return VoteStates.APPLICATION_EXIST;
    }

    // TODO: add communityId in delegation, remove get community by id=1
    const community = await this.communitiesRepository.findOne(1);

    // Check voting power
    const vp = await this.blockchainService.getVotingPowerWithSnapshot(
      address,
      community.contractAddress,
    );
    if (vp <= 0) {
      return VoteStates.NO_POWER;
    }

    return VoteStates.OK;
  }
}
