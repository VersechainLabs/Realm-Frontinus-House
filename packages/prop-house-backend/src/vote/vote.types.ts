import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
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

  @IsNumber()
  @IsOptional()
  weight: number;

  @IsNumber()
  @IsOptional()
  blockHeight: number;

  @IsString()
  @IsOptional()
  communityAddress: string;
}

export class DelegatedVoteDto extends CreateVoteDto {
  delegateId: number;
  delegate: Delegate;

  votingPower: number;
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
