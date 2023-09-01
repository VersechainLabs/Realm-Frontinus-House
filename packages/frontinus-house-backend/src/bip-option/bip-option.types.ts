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

export class CreateBipOptionDto extends SignedEntity {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumber()
  optionType: number;

  // @IsOptional()
  // @ApiProperty()
  // @IsString()
  // previewImage?: string;


  @ApiProperty()
  @IsNumber()
  parentBipRoundId: number;
}

export class UpdateBipOptionDto extends SignedEntity {
  @ApiProperty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsString()
  @IsOptional()
  description: string;

}

export class DeleteBipOptionDto extends SignedEntity {
  @IsNumber()
  id: number;
}

export class GetBipOptionsDto {
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
