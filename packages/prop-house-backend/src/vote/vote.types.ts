import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { SignedEntity } from 'src/entities/signed';
import { Delegate } from '../delegate/delegate.entity';

export class CreateVoteDto extends SignedEntity {
  @IsNumber()
  @IsOptional()
  direction: number;

  @IsNumber()
  proposalId: number;
}

export class DelegatedVoteDto extends CreateVoteDto {
  weight: number;
  actualWeight: number;
  delegateId: number;
  delegateAddress: string;
  delegate: Delegate;
  blockHeight: number;
}

export class VotingPower {
  address: string;
  weight: number;
  actualWeight: number;
  blockNum: number;
  delegateList?: VotingPower[];
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetVoteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Transform(({ value }) => Number(value))
  skip?: number;

  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  @IsEnum(Order)
  order?: Order;

  @IsOptional()
  @IsArray()
  addresses?: string[];
}
