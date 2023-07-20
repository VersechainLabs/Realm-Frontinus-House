import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { Delegate } from './delegate.entity';
import { CreateDelegateDto, GetDelegateDto } from './delegate.types';
import { DelegateService } from './delegate.service';
import { DelegationService } from 'src/delegation/delegation.service';
import { AdminService } from 'src/admin/admin.service';

@Controller('delegates')
  export class DelegateController {
    [x: string]: any;
    constructor(
      private readonly delegateService: DelegateService,
      private readonly delegationService: DelegationService,
      private readonly adminService: AdminService,
    ) {}
  

    @Get('/list')
    async getAll(@Body() dto: GetDelegateDto): Promise<Delegate[]> {

      return this.delegateService.findAll(); 
    }

    @Post('/create')
    async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
      const delegate = new Delegate();
      delegate.delegationId = dto.delegationId;
      delegate.applicationId = dto.applicationId;
      delegate.fromAddress = dto.fromAddress;
      delegate.toAddress = dto.toAddress;

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
  