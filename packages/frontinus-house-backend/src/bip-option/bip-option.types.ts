import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from '../entities/signed';
import { Order } from '../utils/dto-types';

export class CreateBipProposalDto extends SignedEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  what: string;

  @IsOptional()
  @ApiProperty()
  @IsString()
  previewImage?: string;

  @ApiProperty()
  @IsString()
  tldr: string;

  @ApiProperty()
  @IsNumber()
  parentAuctionId: number;
}

export class UpdateBipProposalDto extends SignedEntity {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  title: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  what: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  previewImage?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  tldr: string;
}

export class DeleteBipProposalDto extends SignedEntity {
  @IsNumber()
  id: number;
}

export class GetBipProposalsDto {
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
