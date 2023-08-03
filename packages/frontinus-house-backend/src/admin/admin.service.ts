import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delegation } from 'src/delegation/delegation.entity';
import { Admin } from './admin.entity';
import { CreateAdminDto } from './admin.types';

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
    const adminList = await this.adminRepository.find();

    const isAdmin = adminList.find((v) => v.address === address);

    if (!isAdmin) return false;

    return true;
  }
}
