import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { Delegate } from 'src/delegate/delegate.entity';
import { Admin } from './admin.entity';
// import { CreateNomineeDto, GetNomineesDto, LatestDto } from './nominee.types';

export type AuctionWithProposalCount = Delegate & { numProposals: number };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    ) {}

  findAll(): Promise<Admin[]> {
     return this.adminRepository.find({
    //   where: {
    //     visible: true,
    //   },
    });
  }

}
