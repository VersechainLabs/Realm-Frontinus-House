import { Body, Controller, Get, Post } from '@nestjs/common';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { ProposalsService } from 'src/proposal/proposals.service';
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
}
