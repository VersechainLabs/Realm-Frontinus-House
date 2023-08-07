import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './admin.types';
import config from '../config/configuration';

export type AuctionWithProposalCount = Delegation & { numProposals: number };

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

  searchByAddress(address: string): Promise<Admin[]> {
    return this.adminRepository.find({
      where: {
        address: address,
      },
    });
  }

  async createAdmin(createAdminDto: CreateAdminDto): Promise<Admin> {
    const admin = await this.adminRepository.findOne({
      address: createAdminDto.address,
    });

    if (admin) {
      throw new HttpException('Admin already exists!', HttpStatus.BAD_REQUEST);
    }

    const newRecord = this.adminRepository.create({ ...createAdminDto });
    return await this.adminRepository.save(newRecord);
  }

  async remove(id: number): Promise<void> {
    await this.adminRepository.delete(id);
  }

  async isAdmin(address: string): Promise<boolean> {
    if (!config().enableAdmin) {
      console.log(
        'disable admin check. change `ENABLE_ADMIN` to true to enable admin check.',
      );
      return true;
    }

    const lowerCaseAddress = address.toLowerCase();

    const admin = await this.adminRepository
      .createQueryBuilder('admin')
      .where('LOWER(admin.address) = :lowerCaseAddress', { lowerCaseAddress })
      .getOne();

    return !!admin;
  }
}
