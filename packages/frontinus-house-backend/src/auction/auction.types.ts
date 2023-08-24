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
import { SignedEntity } from '../entities/signed';
import { AuctionVisibleStatus } from '@nouns/frontinus-house-wrapper';

export class CreateAuctionDto extends SignedEntity {
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
  @IsString()
  description: string;

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

export class UpdateAuctionDto extends SignedEntity {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  startTime: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  proposalEndTime: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  votingEndTime: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  fundingAmount: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsInt()
  @IsOptional()
  numWinners: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currencyType: string;
}

export class ApproveAuctionDto extends SignedEntity {
  @ApiProperty({ description: 'The auction ID to approve' })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({ description: 'The approve status' })
  @IsEnum(AuctionVisibleStatus)
  visibleStatus: AuctionVisibleStatus;
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
