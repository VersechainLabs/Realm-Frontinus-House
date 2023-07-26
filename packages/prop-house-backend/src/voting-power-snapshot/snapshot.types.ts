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

export class CreateSnapshotDto {
  // @IsEthereumAddress()
  // address: string;

  @IsInt()
  delegationId: number;

  @IsInt()
  applicationId: number;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetSnapshotDto {
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
  fromAddresses?: string[];
}

export class LatestDto {
  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  timestamp: number;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => Number(value))
  delegateId: number;
}
