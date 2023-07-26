import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
  } from '@nestjs/common';
  import { Snapshot } from './snapshot.entity';
  import { CreateSnapshotDto, GetSnapshotDto } from './snapshot.types';
  import { SnapshotService } from './snapshot.service';
  import { DelegateService } from 'src/delegate/delegate.service';
  import { AdminService } from 'src/admin/admin.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
  
  @Controller('snapshots')
  export class SnapshotController {
    [x: string]: any;
    constructor(
      private readonly snapshotService: SnapshotService,
      private readonly delegateService: DelegateService,
      private readonly adminService: AdminService,
      private readonly blockchainService: BlockchainService,
    ) {}
  
    @Get('/list')
    async getAll(@Body() dto: GetSnapshotDto) {
      return await this.blockchainService.getVotingPowerWithSnapshot(dto.address, dto.blockNum);
      // return await this.blockchainService.cacheAll(17665090);
    }
  
    // @Post('/create')
    // async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
  
    //   if (await this.delegateService.checkDuplication(dto) === true) {
    //     throw new HttpException('Delegate already exists!', HttpStatus.BAD_REQUEST);
    //   }
      
    //   const delegate = new Delegate();
    //   delegate.delegationId = dto.delegationId;
    //   delegate.applicationId = dto.applicationId;
    //   delegate.fromAddress = dto.fromAddress;
    //   delegate.toAddress = dto.toAddress;
  
    //   return this.delegateService.store(delegate);
    // }
  
    // @Get(':id')
    // async findOne(@Param('id') id: number): Promise<Delegate> {
    //   const foundDelegate = await this.delegateService.findOne(id);
  
    //   if (!foundDelegate)
    //     throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);
  
    //   return foundDelegate;
    // }
  }
  