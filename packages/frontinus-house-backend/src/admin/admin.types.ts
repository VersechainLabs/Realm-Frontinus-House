import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsEthereumAddress,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty()
  @IsEthereumAddress()
  address: string;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAdminDto {
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

  // When find comments, should always with proposalId:
  //   @IsInt()
  //   @Min(1)
  //   @Transform(({ value }) => Number(value))
  //   proposalId: number;
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
