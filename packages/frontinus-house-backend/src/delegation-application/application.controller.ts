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
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto } from './application.types';
import { ApplicationService } from './application.service';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';

@Controller('applications')
export class ApplicationController {
  [x: string]: any;

  constructor(private readonly applicationService: ApplicationService) {}

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
    return await this.applicationService.createApplicationByDelegation(dto);
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
}
