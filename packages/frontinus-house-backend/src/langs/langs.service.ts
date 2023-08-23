import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { Langs } from './langs.entity';
// import { CreateAdminDto } from './langs.types';
import config from '../config/configuration';

export type AuctionWithProposalCount = Delegation & { numProposals: number };

@Injectable()
export class LangService {
  constructor(
    @InjectRepository(Langs) private langRepository: Repository<Langs>,
  ) {}

  async findAll(): Promise<Langs[]> {
    return this.langRepository.find({
      //   where: {
      //     visible: true,
      //   },
    });
  }

  async searchByIds(ids: Array<number>): Promise<Langs[]> {
    return this.langRepository.find({
        where: {id: In (ids)},
    });
  }

}
