import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { SignedEntity } from '../entities/signed';
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateDelegateDto {
  // @IsInt()
  // @IsOptional()
  // delegationId: number;

  @IsInt()
  applicationId: number;

  @IsString()
  address: string; // "From" Address

  // @IsString()
  // @IsOptional()
  // toAddress: string;
}

export class DeleteDelegateDto extends SignedEntity {
  @ApiProperty({ description: 'The delegate ID to delete' })
  @IsNumber()
  id: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetDelegateDto {
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
  fromAddresses?: string[];
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
