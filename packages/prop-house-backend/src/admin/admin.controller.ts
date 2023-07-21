import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Post('/:id/delete')
  async delete(@Param('id') id: number): Promise<boolean> {
    await this.adminService.remove(id);
    return true;
  }  
}
