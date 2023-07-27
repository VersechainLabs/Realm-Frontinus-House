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

@Controller('applications')
export class ApplicationController {
  [x: string]: any;
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly delegationService: DelegationService,
  ) {}

  @Get('/list')
  getAll(): Promise<Application[]> {
    return this.applicationService.findAll();
  }

  @Get('/byDelegation/:delegationId')
  async findByDelegation(
    @Param('delegationId') delegationId: number,
    @Body() dto: GetApplicationDto,
  ) {
    const applications = await this.applicationService.findByDelegation(
      delegationId,
      dto,
    );
    if (!applications)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    return applications;
  }

  @Post('/create')
  async create(@Body() dto: CreateApplicationDto): Promise<Application> {
    return await this.applicationService.createApplicationByDelegation(dto);
  }

  @Get('/:id/detail')
  async findOne(@Param('id') id: number): Promise<Application> {
    const foundApplication = await this.applicationService.findOne(id);

    if (!foundApplication)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);

    return foundApplication;
  }
}
