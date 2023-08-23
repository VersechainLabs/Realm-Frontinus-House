import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from '../entities/signed';

export class CreateCommentDto extends SignedEntity {
  @IsString()
  content: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  proposalId: number;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  applicationId: number;
}

export class UpdateCommentDto extends SignedEntity {
  @IsString()
  content: string;

  @IsNumber()
  @IsPositive()
  id: number;
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
