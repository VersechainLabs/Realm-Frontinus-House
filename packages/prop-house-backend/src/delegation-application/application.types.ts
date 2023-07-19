import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  address: string;

//   @IsString()
//   signedData: string;

  @IsString()
  title: string;

  @IsString()
  tldr: string;

  @IsString()
  description: string;

  @IsNumber()
  @IsPositive()
  delegationId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetApplicationDto {
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
