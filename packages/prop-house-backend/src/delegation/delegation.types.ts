import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
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

  @MinLength(3)
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
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
