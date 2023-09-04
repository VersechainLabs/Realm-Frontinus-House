import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto, UpdateApplicationDto } from './application.types';
import { ApplicationService } from './application.service';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { BlockchainService } from '../blockchain/blockchain.service';
import { DelegationService } from '../delegation/delegation.service';
import { DelegateService } from '../delegate/delegate.service';
import { Community } from '../community/community.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApplicationCreateStatus,
  ApplicationCreateStatusMap,
} from '@nouns/frontinus-house-wrapper';
import { Delegation } from '../delegation/delegation.entity';
import { canSubmitApplications, updateValidFields } from 'src/utils';

@Controller('applications')
export class ApplicationController {
  [x: string]: any;

  constructor(
    private readonly applicationService: ApplicationService,
    private readonly delegationService: DelegationService,
    private readonly delegateService: DelegateService,
    private readonly blockchainService: BlockchainService,
    @InjectRepository(Community)
    private communitiesRepository: Repository<Community>,
  ) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Application],
  })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get('/byDelegation/:delegationId')
  @ApiOkResponse({
    type: [Application],
  })
  async findByDelegation(
    @Param('delegationId') delegationId: number,
    @Body() dto: GetApplicationDto,
  ): Promise<Application[]> {
    const applications = await this.applicationService.findByDelegation(
      delegationId,
      dto,
    );
    if (!applications)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    return applications;
  }

  @Get('/checkApplied')
  @ApiOkResponse({
    type: Boolean,
  })
  async findApplied(
    @Query('delegationId') delegationId: number,
    @Query('address') address: string,
  ): Promise<boolean> {
    const application = await this.applicationService.findByAddress(
      delegationId,
      address,
    );

    if (!application) return false;
    return true;
  }

  @Post('/create')
  @ApiOkResponse({
    type: Application,
  })
  async create(
    @Body(ECDSASignedPayloadValidationPipe) dto: CreateApplicationDto,
  ): Promise<Application> {
    verifySignPayload(dto, ['delegationId', 'title']);

    // Delegation must exists:
    const delegation = await this.delegationService.findOne(dto.delegationId);
    if (!delegation) {
      throw new HttpException(
        'Delegation not found. Cannot create application',
        HttpStatus.BAD_REQUEST,
      );
    }

    const canCreateStatus = await this.checkCanCreateApplication(
      delegation,
      dto.address,
    );
    if (canCreateStatus.code !== ApplicationCreateStatusMap.OK.code) {
      throw new HttpException(canCreateStatus.message, HttpStatus.BAD_REQUEST);
    }

    // Create:
    const newApplication = await this.applicationService.create({
      ...dto,
      delegation,
    });
    return await this.applicationService.store(newApplication);
  }

  @Patch('/edit')
  @ApiOkResponse({
    type: Application,
  })
  async editApplication(
    @Body(ECDSASignedPayloadValidationPipe) dto: UpdateApplicationDto,
  ): Promise<Application> {
    const updateKeys = ['description', 'tldr', 'title', 'previewImage'];

    verifySignPayload(dto, ['id', ...updateKeys]);

    // Delegation must exists:
    const foundApplication = await this.applicationService.findOne(dto.id);
    if (!foundApplication) {
      throw new HttpException(
        'No application with that ID exists',
        HttpStatus.NOT_FOUND,
      );
    }

    if (!canSubmitApplications(foundApplication.delegation))
      throw new HttpException(
        'You cannot edit application for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    if (dto.address !== foundApplication.address)
      throw new HttpException(
        "Found application does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    updateValidFields(foundApplication, dto, updateKeys);
    return await this.applicationService.store(foundApplication);
  }  

  @Get('/canCreate')
  @ApiOkResponse({
    type: ApplicationCreateStatus,
  })
  async check(
    @Query('delegationId') delegationId: number,
    @Query('address') address: string,
  ): Promise<ApplicationCreateStatus> {
    // Delegation must exists:
    const delegation = await this.delegationService.findOne(delegationId);
    if (!delegation) {
      throw new HttpException(
        'Delegation not found. Cannot create application',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.checkCanCreateApplication(delegation, address);
  }

  @Get('/:id/detail')
  @ApiOkResponse({
    type: Application,
  })
  async findOne(@Param('id') id: number): Promise<Application> {
    const foundApplication = await this.applicationService.findOne(id);

    if (!foundApplication)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);

    return foundApplication;
  }

  async checkCanCreateApplication(
    delegation: Delegation,
    address: string,
  ): Promise<ApplicationCreateStatus> {
    const delegationId = delegation.id;
    const currentDate = new Date();
    if (
      currentDate < delegation.startTime ||
      currentDate > delegation.proposalEndTime
    ) {
      return ApplicationCreateStatusMap.WRONG_PERIOD;
    }

    // Same Application must NOT exists:
    const existingApplication = await this.applicationService.findBy({
      where: { delegationId: delegationId, address: address },
    });

    if (existingApplication) {
      return ApplicationCreateStatusMap.CREATED;
    }

    // Can not create application if he already delegate to another user.
    const existingDelegate = await this.delegateService.findOneBy({
      where: { delegationId: delegationId, fromAddress: address },
    });
    if (existingDelegate) {
      return ApplicationCreateStatusMap.DELEGATE_TO_OTHER;
    }

    // TODO: add communityId in delegation, remove get community by id=1
    const community = await this.communitiesRepository.findOne(1);
    // Check voting power
    const vp = await this.blockchainService.getVotingPowerWithSnapshot(
      address,
      community.contractAddress,
    );
    if (vp <= 0) {
      return ApplicationCreateStatusMap.NO_VOTING_POWER;
    }

    return ApplicationCreateStatusMap.OK;
  }
}
