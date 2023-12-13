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
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { SignedEntity } from '../entities/signed';

export class CreateDelegationDto extends SignedEntity {
  @ApiProperty({})
  @IsString()
  @IsOptional()
  startTime: Date;

  @ApiProperty({})
  @IsString()
  proposalEndTime: Date;

  @ApiProperty({})
  @IsString()
  votingEndTime: Date;

  @ApiProperty({})
  @IsString()
  endTime: Date;

  @ApiProperty({})
  @MinLength(3)
  @MaxLength(100)
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({})
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  communityId?: number;  
}

export class DeleteDelegationDto extends SignedEntity {
  @ApiProperty({ description: 'The delegation ID to delete' })
  @IsNumber()
  @IsOptional()
  id: number;
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
