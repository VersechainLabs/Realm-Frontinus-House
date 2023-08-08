import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { SignedEntity } from '../entities/signed';

export class CreateAdminDto extends SignedEntity {}

export enum UserType {
  Admin = 'Admin',
  User = 'User',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetAdminDto {
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
  delegationId: number;
}
