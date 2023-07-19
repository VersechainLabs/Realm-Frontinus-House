import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { proposalCountSubquery } from 'src/utils/proposal-count-subquery';
import { Repository } from 'typeorm';
import { Community } from 'src/community/community.entity';
import { Auction } from 'src/auction/auction.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './admin.types';
import { Proposal } from 'src/proposal/proposal.entity';

export type AuctionWithProposalCount = Delegation & { numProposals: number };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Admin) private adminRepository: Repository<Admin>,
    // @InjectRepository(Proposal) private proposalRepository: Repository<Proposal>,
    ) {}

  findAll(): Promise<Admin[]> {
     return this.adminRepository.find({
    //   where: {
    //     visible: true,
    //   },
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({address: createAdminDto.address});

    if (admin) {
      throw new HttpException(
        'Admin already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newRecord = this.adminRepository.create({...createAdminDto});
    return await this.adminRepository.save(newRecord);
  }
}
