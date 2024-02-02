import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { CreateAdminDto, UserType } from './admin.types';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import config from '../config/configuration';
// import * as Sentry from "@sentry/node";

@Controller('admins')
export class AdminsController {
  [x: string]: any;

  constructor(private readonly adminService: AdminService) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Admin],
  })
  getAll(): Promise<Admin[]> {
    // const transaction = Sentry.startTransaction({
    //   op: "test",
    //   name: "My First Test Transaction",
    // });
    
    // setTimeout(() => {
    //   try {
    //     this.foo();
    //   } catch (e) {
    //     Sentry.captureException(e);
    //   } finally {
    //     transaction.finish();
    //   }
    // }, 99);

    return this.adminService.findAll();
  }
  // foo(){
  //   console.log('run foo')
  //   throw new HttpException('BAD_GATEWAY', HttpStatus.BAD_GATEWAY); 
  // }

  @Get('/forCommunity/:id')
  async findAllForCommunity(
    @Param('id', ParseIntPipe) id: number,
    @Query('address') address: UserType
  ): Promise<UserType> {
    const admins = await this.adminService.findAllForCommunity(
      id, address
    );

    // 6v在env里加了个开关，enable为false的时候，全部用户都是admin:
    if (!config().enableAdmin) return UserType.Admin;

    // return (await adminRecord).length;
    if ((await admins).length === 0) return UserType.User;

    return UserType.Admin;
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

    // 6v在env里加了个开关，enable为false的时候，全部用户都是admin:
    if (!config().enableAdmin) return UserType.Admin;

    // return (await adminRecord).length;
    if ((await adminRecord).length === 0) return UserType.User;

    return UserType.Admin;
  }
}
