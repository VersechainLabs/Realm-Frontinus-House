import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from 'src/entities/signed';
import { Order } from 'src/utils/dto-types';

export type ProposalParent = 'auction' | 'infinite-auction';

export class CreateProposalDto extends SignedEntity {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({})
  @IsString()
  what: string;

  @ApiProperty({})
  @IsString()
  tldr: string;

  @ApiProperty({})
  @IsNumber()
  parentAuctionId: number;

  @ApiProperty({})
  @IsString()
  parentType: ProposalParent;
}

export class CreateInfiniteAuctionProposalDto extends CreateProposalDto {
  @IsNumber()
  reqAmount: number;

  parentType: 'infinite-auction';
}

export class UpdateProposalDto extends CreateProposalDto {
  @IsNumber()
  id: number;

  @IsOptional()
  reqAmount?: number;
}

export class DeleteProposalDto extends SignedEntity {
  @IsNumber()
  id: number;
}

export class GetProposalsDto {
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
