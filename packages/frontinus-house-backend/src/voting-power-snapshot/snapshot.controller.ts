import { Body, Controller, Get } from '@nestjs/common';
import { GetSnapshotDto } from './snapshot.types';
import { SnapshotService } from './snapshot.service';
import { DelegateService } from 'src/delegate/delegate.service';
import { AdminService } from 'src/admin/admin.service';
import { BlockchainService } from 'src/blockchain/blockchain.service';
import config from '../config/configuration';

@Controller('snapshots')
export class SnapshotController {
  [x: string]: any;
  private readonly communityAddress = config().communityAddress;

  constructor(
    private readonly snapshotService: SnapshotService,
    private readonly delegateService: DelegateService,
    private readonly adminService: AdminService,
    private readonly blockchainService: BlockchainService,
  ) {}

  @Get('/list')
  async getAll(@Body() dto: GetSnapshotDto) {
    return await this.blockchainService.getVotingPowerWithSnapshot(
      dto.address,
      this.communityAddress,
      dto.blockNum,
    );
  }
  //
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
