import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateAuctionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  startTime: Date;

  @ApiProperty()
  @IsString()
  proposalEndTime: Date;

  @ApiProperty()
  @IsString()
  votingEndTime: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  fundingAmount: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  numWinners: number;

  @ApiProperty()
  @IsString()
  currencyType: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  communityId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAuctionsDto {
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
  auctionId: number;
}
