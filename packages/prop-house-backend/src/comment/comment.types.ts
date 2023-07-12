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

export class CreateCommentDto {
  @IsString()
  content: string;

  @IsString()
  owner: string;

  @IsNumber()
  @IsPositive()
  proposalId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetCommentsDto {
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
  delegateId: number;
}
