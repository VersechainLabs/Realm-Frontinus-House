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
  import { ParseDate } from 'src/utils/date';
  import { Admin } from './admin.entity';
  import { AdminService} from './admin.service';
  import { ProposalsService } from 'src/proposal/proposals.service';
  import { Proposal } from 'src/proposal/proposal.entity';
  import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';
  import { Order } from 'src/utils/dto-types';
import { ECDSAPersonalSignedPayloadValidationPipe } from '../entities/ecdsa-personal-signed.pipe';
import { CreateAdminDto } from './admin.types';
  
  @Controller('admins')
  export class AdminsController {
    [x: string]: any;
    constructor(
      private readonly adminService: AdminService,
      private readonly proposalService: ProposalsService,
    ) {}
  
    @Get('/list')
    getAll(): Promise<Admin[]> {
      return this.adminService.findAll(); 
    }
  

    @Post('/create')
    async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
        return await this.adminService.createAdmin(createAdminDto);
    }
    
    @Post('/:id/delete')
    async delete(@Param('id') id: number): Promise<boolean> {
      await this.adminService.remove(id);
      return true;
    }
    
  }