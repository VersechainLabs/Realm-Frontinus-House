import { Injectable } from '@nestjs/common';
import { Snapshot } from './snapshot.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SnapshotService {
  constructor(
    @InjectRepository(Snapshot)
    private snapshotRepository: Repository<Snapshot>,
  ) {}

  findBy(
    communityAddress: string,
    blockNum: number,
    address: string,
  ): Promise<Snapshot> {
    return this.snapshotRepository.findOne({
      where: { communityAddress, address, blockNum },
    });
  }

  async store(value: Snapshot): Promise<Snapshot> {
    return await this.snapshotRepository.save(value, { reload: true });
  }

  storeMany(valueList: Snapshot[]): Promise<Snapshot[]> {
    return this.snapshotRepository.save(valueList);
  }
}
