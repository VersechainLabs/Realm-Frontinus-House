import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ParseDate } from '../utils/date';
import { Delegation } from './delegation.entity';
import {
  CreateDelegationDto,
  DeleteDelegationDto,
  GetDelegationDto,
} from './delegation.types';
import { DelegationService } from './delegation.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { AdminService } from '../admin/admin.service';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { verifySignPayload } from '../utils/verifySignedPayload';
import { ECDSASignedPayloadValidationPipe } from '../entities/ecdsa-signed.pipe';

@Controller('delegations')
export class DelegationController {
  [x: string]: any;

  constructor(
    private readonly delegationService: DelegationService,
    private readonly adminService: AdminService,
  ) {}

  @Get('/list')
  @ApiOkResponse({
    type: [Delegation],
  })
  async getAll(@Body() dto: GetDelegationDto): Promise<Delegation[]> {
    return this.delegationService.findAll();
  }

  @Post('/create')
  @ApiOkResponse({
    type: Delegation,
  })
  async create(
    @Body(SignedPayloadValidationPipe) dto: CreateDelegationDto,
  ): Promise<Delegation> {
    verifySignPayload(dto, [
      'startTime',
      'proposalEndTime',
      'votingEndTime',
      'endTime',
      'title',
    ]);
    await this.adminService.ensureIsAdmin(dto.address);

    // Check if the current input parameter's time is correct.
    const startTime = dto.startTime ? ParseDate(dto.startTime) : new Date();
    if (
      startTime >= dto.proposalEndTime ||
      dto.proposalEndTime >= dto.votingEndTime ||
      dto.votingEndTime >= dto.endTime
    ) {
      throw new HttpException('Time order incorrect!', HttpStatus.BAD_REQUEST);
    }

    // Check whether the effective time of the current incoming delegation conflicts with the existing delegation.
    const conflictDelegateList =
      await this.delegationService.getConflictDelegateByTimeRange(dto);
      
    if (conflictDelegateList.length > 0) {
      // 龙哥需要delegation info来展示. 比如endTime换成当前用户时区来展示:
      throw new HttpException(
        JSON.stringify(conflictDelegateList[0]),
        HttpStatus.EXPECTATION_FAILED,
      );
      // throw new HttpException(
      //   `The time to end the selection period is in conflict with the current active delegation. Please select a time that is later than ${conflictDelegateList[0].endTime}.`,
      //   HttpStatus.BAD_REQUEST,
      // );
    }

    const delegation = new Delegation();
    delegation.title = dto.title;
    delegation.description = dto.description;
    delegation.startTime = startTime;
    delegation.proposalEndTime = ParseDate(dto.proposalEndTime);
    delegation.votingEndTime = ParseDate(dto.votingEndTime);
    delegation.endTime = ParseDate(dto.endTime);
    delegation.communityId = dto.communityId;
    return this.delegationService.store(delegation);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Delegation> {
    const foundDelegation = await this.delegationService.findOne(id);

    if (!foundDelegation)
      throw new HttpException('Delegation not found', HttpStatus.NOT_FOUND);

    return foundDelegation;
  }

  @Post('/delete')
  @ApiOkResponse({
    type: Boolean,
  })
  async delete(
    @Body(ECDSASignedPayloadValidationPipe) dto: DeleteDelegationDto,
  ): Promise<boolean> {
    verifySignPayload(dto, ['id']);
    await this.adminService.ensureIsAdmin(dto.address);

    // Admin remove it. No need to check owner.
    await this.delegationService.remove(dto.id);
    return true;
  }
}
