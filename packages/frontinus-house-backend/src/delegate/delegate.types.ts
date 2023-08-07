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
  @IsOptional()
  id: number;

  @ApiProperty({ description: 'The application ID to delete delegate' })
  @IsNumber()
  @IsOptional()
  applicationId: number;
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

// export enum DelegateAPIResponses {
//   OK = 'Success',
//   NO_APPLICATION = 'Can not find application',
//   NOT_VOTING = 'Not in the eligible voting period.',
//   DELEGATED = 'Already delegate to another address.',
//   OCCUPIED = 'Already created application. Can not delegate.',
// }
// export const DelegateAPIResponses = {
//   OK : { Code: 20000, Detail: "Success"},
//   NO_APPLICATION : { Code: 40031, Detail: "Can not find application"},
//   NOT_VOTING : { Code: 40032, Detail: 'Not in the eligible voting period.'},
//   DELEGATED : { Code: 40033, Detail: 'Already delegate to another address.'},
//   OCCUPIED : { Code: 40034, Detail: 'Already created application. Can not delegate.'},
// };
// export const APIResponses = {
//   OK : { Code: 20000, Detail: "Success"},
//   DELEGATE : {
//     NO_APPLICATION : { Code: 40031, Detail: "Can not find application"},
//     NOT_VOTING : { Code: 40032, Detail: 'Not in the eligible voting period.'},
//     DELEGATED : { Code: 40033, Detail: 'Already delegate to another address.'},
//     OCCUPIED : { Code: 40034, Detail: 'Already created application. Can not delegate.'},
//   }

// };


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