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

export class CreateBipRoundDto extends SignedEntity {
  @ApiProperty()
  @IsString()
  @IsOptional()
  startTime: Date;

  @ApiProperty()
  @IsString()
  endTime: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;
}

export class UpdateBipRoundDto extends SignedEntity {
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
  endTime: Date;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;
}


export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetBipRoundDto {
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
