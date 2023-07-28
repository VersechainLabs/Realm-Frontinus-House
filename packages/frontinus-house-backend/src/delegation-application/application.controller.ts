import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto } from './application.types';
import { DelegationService } from 'src/delegation/delegation.service';
import { ApplicationService } from './application.service';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';

@Controller('applications')
export class ApplicationController {
  [x: string]: any;
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly delegationService: DelegationService,
  ) {}


  @Get('/list')
  @ApiOkResponse({
    type: [Application],
  }) 
  @ApiResponse({ status: 201, description: 'The record has been successfully created.'})
  @ApiResponse({ status: 403, description: 'Forbidden.'})
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

  @Post('/create')
  @ApiOkResponse({
    type: Application,
  })   
  async create(@Body() dto: CreateApplicationDto): Promise<Application> {
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
