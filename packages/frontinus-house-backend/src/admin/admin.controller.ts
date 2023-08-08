import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { CreateAdminDto, UserType } from './admin.types';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';

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
  async create(
    @Body(SignedPayloadValidationPipe) dto: CreateAdminDto,
  ): Promise<Admin> {
    await this.adminService.ensureIsAdmin(dto.address);
    return await this.adminService.createAdmin(dto);
  }

  @Post('/getUserType')
  // @ApiOkResponse({
  //   description: 'Id가 일치하는 유저 정보를 조회한다.',
  //   type: UserResponseDto,
  // })
  async search(@Query('address') address: UserType) {
    const adminRecord = this.adminService.searchByAddress(address);

    // return (await adminRecord).length;
    if ((await adminRecord).length === 0) return UserType.User;

    return UserType.Admin;
  }
}
