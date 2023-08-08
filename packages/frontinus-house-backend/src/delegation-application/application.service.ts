import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Delegation } from '../delegation/delegation.entity';
import { Application } from './application.entity';
import { CreateApplicationDto, GetApplicationDto } from './application.types';
import { Delegate } from '../delegate/delegate.entity';

@Injectable()
export class ApplicationService {
  constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
    @InjectRepository(Delegation)
    private delegationRepository: Repository<Delegation>,
    @InjectRepository(Delegate)
    private delegateRepository: Repository<Delegate>,
  ) {}

  findOne(id: number): Promise<Application> {
    return this.applicationRepository.findOne(id, {
      relations: ['delegation'],
      where: { visible: true },
    });
  }

  findAll(): Promise<Application[]> {
    return this.applicationRepository.find({
      // loadRelationIds: {
      //   relations: ['proposals.auction', 'community'],
      // },
      where: {
        visible: true,
      },
    });
  }

  // Chao
  async createApplicationByDelegation(
    // communityId: number,
    dto: CreateApplicationDto,
  ) {
    // Delegation must exists:
    const delegation = await this.delegationRepository.findOne(
      dto.delegationId,
    );

    if (!delegation) {
      throw new HttpException(
        'Delegation not found. Cannot create application',
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentDate = new Date();
    if (
      currentDate < delegation.startTime ||
      currentDate > delegation.proposalEndTime
    ) {
      throw new HttpException(
        'Not in the eligible create application period.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Same Application must NOT exists:
    const existingApplication = await this.applicationRepository.findOne({
      where: { delegationId: dto.delegationId, address: dto.address },
    });

    if (existingApplication) {
      throw new HttpException(
        'Application already exists!',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Can not create application if he already delegate to another user.
    const existingDelegate = await this.delegateRepository.findOne({
      where: { delegationId: dto.delegationId, fromAddress: dto.address },
    });
    if (existingDelegate) {
      throw new HttpException(
        'Already delegate to another',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create:
    const newApplication = this.applicationRepository.create({
      ...dto,
      delegation,
    });
    return await this.applicationRepository.save(newApplication);
  }

  async findByDelegation(
    delegationId: number,
    dto: GetApplicationDto,
  ): Promise<Application[]> {
    return await this.applicationRepository
      .createQueryBuilder('a')
      .select('a.*')
      .where('a.delegationId = :deId', { deId: delegationId })
      .offset(dto.skip)
      .limit(dto.limit)
      .orderBy('id', dto.order)
      .getRawMany();
  }

  async findByAddress(
    delegationId: number,
    address: string,
  ): Promise<Application> {
    return await this.applicationRepository.findOne({
      where: { delegationId, address },
    });
  }

  async store(value: Application): Promise<Application> {
    return await this.applicationRepository.save(value, { reload: true });
  }
}
