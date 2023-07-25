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
import { CreateDelegateDto, GetDelegateDto } from './delegate.types';
import { DelegateService } from './delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';
import { AdminService } from 'src/admin/admin.service';
import { ApplicationService } from '../delegation-application/application.service';

@Controller('delegates')
export class DelegateController {
  [x: string]: any;

  constructor(
    private readonly delegateService: DelegateService,
    private readonly delegationService: DelegationService,
    private readonly adminService: AdminService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Get('/list')
  async getAll(@Body() dto: GetDelegateDto): Promise<Delegate[]> {
    return this.delegateService.findAll();
  }

  @Post('/create')
  async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
    if ((await this.delegateService.checkDuplication(dto)) === true) {
      throw new HttpException(
        'Delegate already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const application = await this.applicationService.findOne(
      dto.applicationId,
    );

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
  async findOne(@Param('id') id: number): Promise<Delegate> {
    const foundDelegate = await this.delegateService.findOne(id);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    return foundDelegate;
  }
}
