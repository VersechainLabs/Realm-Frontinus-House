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
    const applictions = await this.applicationService.findByDelegation(
      delegationId,
      dto,
    );
    if (!applictions)
      throw new HttpException('Application not found', HttpStatus.NOT_FOUND);
    return applictions;
  }

  @Post('/create')
  async create(@Body() dto: CreateApplicationDto): Promise<Application> {
    return await this.applicationService.createApplicationByDelegation(dto);
  }
}
