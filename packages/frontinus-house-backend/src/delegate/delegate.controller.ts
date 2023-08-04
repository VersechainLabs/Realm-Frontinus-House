import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { Delegate } from './delegate.entity';
import { CreateDelegateDto, DeleteDelegateDto } from './delegate.types';
import { DelegateService } from './delegate.service';
import { ApplicationService } from '../delegation-application/application.service';
import { ApiOkResponse } from '@nestjs/swagger';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';
import { ApiResponse } from '@nestjs/swagger/dist/decorators/api-response.decorator';
import { Delete } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { verifySignPayload } from '../utils/verifySignedPayload';

@Controller('delegates')
export class DelegateController {
  [x: string]: any;

  constructor(
    private readonly delegateService: DelegateService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Post('/create')
  @ApiOkResponse({
    type: Delegate,
  })
  async create(@Body() dto: CreateDelegateDto): Promise<Delegate> {
    const application = await this.applicationService.findOne(
      dto.applicationId,
    );

    const currentTime = new Date();
    if (
      currentTime < application.delegation.proposalEndTime ||
      currentTime > application.delegation.votingEndTime
    ) {
      throw new HttpException(
        'Not in the eligible voting period.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existDelegate = await this.delegateService.findByFromAddress(
      application.delegationId,
      dto.address,
    );
    if (existDelegate) {
      throw new HttpException(
        `Already delegate to ${existDelegate.toAddress}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const createdApplication = await this.applicationService.findByAddress(
      application.delegationId,
      dto.address,
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
    delegate.fromAddress = dto.address;
    delegate.toAddress = application.address;

    return this.delegateService.store(delegate);
  }

  @Get('/checkExist')
  @ApiOkResponse({
    type: Boolean,
  })
  async checkDelegateExist(
    @Query('applicationId') applicationId: number,
    @Query('address') fromAddress: string,
  ) {
    const foundDelegate = await this.delegateService.checkDelegateExist(
      applicationId,
      fromAddress,
    );

    if (!foundDelegate) return false;

    return true;
  }

  @Get('/canVote')
  @ApiOkResponse({
    type: Boolean,
  })
  async checkDelegateCanVote(
    @Query('applicationId') applicationId: number,
    @Query('address') fromAddress: string,
  ): Promise<object> {
    if ((await this.checkDelegateExist(applicationId, fromAddress)) === false) {
      return {
        message: 'Delegate not exists',
        status: false,
      };
    }
    // Similar to /create:
    const application = await this.applicationService.findOne(applicationId);

    const currentTime = new Date();
    if (
      currentTime < application.delegation.proposalEndTime ||
      currentTime > application.delegation.votingEndTime
    ) {
      return {
        message: 'Not in the eligible voting period.',
        status: false,
      };
    }

    const existDelegate = await this.delegateService.findByFromAddress(
      application.delegationId,
      fromAddress,
    );
    if (existDelegate) {
      return {
        message: `Already delegate to ${existDelegate.toAddress}`,
        status: false,
      };
    }

    const createdApplication = await this.applicationService.findByAddress(
      application.delegationId,
      fromAddress,
    );
    if (createdApplication) {
      return {
        message: `Already created application. Can not delegate to ${application.address}`,
        status: false,
      };
    }

    return {
      message: `Can vote!`,
      status: true,
    };
  }

  @Get('/list')
  @ApiOkResponse({
    type: [Delegate],
  })
  async listByAppliactionID(
    @Query('applicationId') applicationId: number,
  ): Promise<object> {
    const foundDelegate =
      await this.delegateService.getDelegateListByApplicationId(applicationId);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    const results = {
      total: foundDelegate.length,
      delegates: foundDelegate,
    };

    return results;
  }

  @Get(':id')
  @ApiOkResponse({
    type: Delegate,
  })
  async findOne(@Param('id') id: number): Promise<Delegate> {
    const foundDelegate = await this.delegateService.findOne(id);

    if (!foundDelegate)
      throw new HttpException('Delegate not found', HttpStatus.NOT_FOUND);

    return foundDelegate;
  }

  @ApiOperation({
    summary: 'Remove delegate',
  })
  @ApiResponse({
    status: 200,
    description: 'The delegate has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @Delete()
  async deleteOne(
    @Body(SignedPayloadValidationPipe) deleteDelegateDto: DeleteDelegateDto,
  ): Promise<boolean> {
    verifySignPayload(deleteDelegateDto, ['id', 'applicationId']);

    let foundDelegate;
    if (deleteDelegateDto.id) {
      foundDelegate = await this.delegateService.findOne(deleteDelegateDto.id);
    } else if (deleteDelegateDto.applicationId) {
      foundDelegate = await this.delegateService.findOneBy({
        where: {
          fromAddress: deleteDelegateDto.address,
          applicationId: deleteDelegateDto.applicationId,
        },
      });
    } else {
      throw new HttpException(
        'Missing id or applicationId',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!foundDelegate) {
      throw new HttpException('No Delegate with that ID', HttpStatus.NOT_FOUND);
    }
    if (
      foundDelegate.fromAddress.toLowerCase() !==
      deleteDelegateDto.address.toLowerCase()
    ) {
      throw new HttpException(
        'Can not unapproved this delegate',
        HttpStatus.BAD_REQUEST,
      );
    }

    const foundApplication = await this.applicationService.findOne(
      foundDelegate.applicationId,
    );
    const currentTime = new Date();
    if (currentTime > foundApplication.delegation.votingEndTime) {
      throw new HttpException(
        'Delegation round had been ended.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Start remove delegate.
    await this.delegateService.remove(foundDelegate.id);
    return true;
  }
}
