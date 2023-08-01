import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { CreateAdminDto } from './admin.types';
import { ApiOkResponse } from '@nestjs/swagger';

@Controller('admins')
export class AdminsController {
  [x: string]: any;
  constructor(private readonly adminService: AdminService) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Admin],
  })
  getAll(): Promise<Admin[]> {
    return this.adminService.findAll();
  }

  @Post('/create')
  @ApiOkResponse({
    type: Admin,
  })
  async create(@Body() createAdminDto: CreateAdminDto): Promise<Admin> {
    return await this.adminService.createAdmin(createAdminDto);
  }

  @Post('/:id/delete')
  async delete(@Param('id') id: number): Promise<boolean> {
    await this.adminService.remove(id);
    return true;
  }
}
