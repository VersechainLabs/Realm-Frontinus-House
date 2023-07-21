import { Transform } from 'class-transformer';
import { IsEthereumAddress } from 'class-validator';

import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  isEthereumAddress,
} from 'class-validator';

export class CreateDelegationDto {
  // @IsEthereumAddress()
  // address: string;

  @IsString()
  @IsOptional()
  startTime: Date;

  @IsString()
  proposalEndTime: Date;

  @IsString()
  votingEndTime: Date;

  @IsString()
  endTime: Date;

  @IsString()
  title: string;

  @IsString()
  description: string;

  //   @IsNumber()
  //   @IsPositive()
  //   communityId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum DelegationState {
  NOT_START = 'not start',
  APPLYING = 'applying',
  DELEGATING = 'delegating',
  ACTIVE = 'delegation active',
  EXPIRED = 'delegation expired',
}

export class GetDelegationDto {
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

export class LatestDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  timestamp: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  delegationId: number;
}
