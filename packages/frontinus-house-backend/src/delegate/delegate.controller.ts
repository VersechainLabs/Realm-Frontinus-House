import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { Delegate } from './delegate.entity';
import { CreateDelegateDto } from './delegate.types';
import { DelegateService } from './delegate.service';
import { ApplicationService } from '../delegation-application/application.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('delegates')
export class DelegateController {
  [x: string]: any;

  constructor(
    private readonly delegateService: DelegateService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Post('/create')
  @ApiOkResponse({
    type: Delegate,
  })
  async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
    const application = await this.applicationService.findOne(
      dto.applicationId,
    );

    const currentTime = new Date();
    if (
      currentTime < application.delegation.proposalEndTime ||
      currentTime > application.delegation.votingEndTime
    ) {
      throw new HttpException(
        'Not in the eligible voting period.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existDelegate = await this.delegateService.findByFromAddress(
      application.delegationId,
      dto.fromAddress,
    );
    if (existDelegate) {
      throw new HttpException(
        `Already delegate to ${existDelegate.toAddress}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdApplication = await this.applicationService.findByAddress(
      application.delegationId,
      dto.fromAddress,
    );
    if (createdApplication) {
      throw new HttpException(
        `Already created application. Can not delegate to ${application.address}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const delegate = new Delegate();
    delegate.delegationId = application.delegationId;
    delegate.applicationId = dto.applicationId;
    delegate.fromAddress = dto.fromAddress;
    delegate.toAddress = application.address;

    return this.delegateService.store(delegate);
  }

  @Get(':id')
  @ApiOkResponse({
    type: Delegate,
  })
  async findOne(@Param('id') id: number): Promise<Delegate> {
    const foundDelegate = await this.delegateService.findOne(id);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    return foundDelegate;
  }
}
