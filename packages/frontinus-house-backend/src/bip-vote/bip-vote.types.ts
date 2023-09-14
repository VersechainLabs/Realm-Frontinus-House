import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { SignedEntity } from '../entities/signed';
import { Delegate } from '../delegate/delegate.entity';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger/dist/decorators/api-property.decorator';

export class CreateBipVoteDto extends SignedEntity {
  @ApiProperty({ deprecated: true })
  @IsNumber()
  @IsOptional()
  direction: number;

  @ApiProperty({ description: 'The option ID for vote' })
  @IsNumber()
  bipOptionId: number;
}

export class DeleteBipVoteDto extends SignedEntity {
  @ApiProperty({ description: 'The vote ID to delete' })
  @IsNumber()
  @IsOptional()
  id: number;

  @ApiProperty({ description: 'The option ID to delete vote' })
  @IsNumber()
  @IsOptional()
  bipOptionId: number;
}

export class DeleteVoteDto extends SignedEntity {
  @ApiProperty({ description: 'The bip ID to delete vote' })
  @IsNumber()
  @IsOptional()
  bipRoundId: number;
}


export class DelegatedBipVoteDto extends CreateBipVoteDto {
  weight: number;
  actualWeight: number;
  delegateId: number;
  delegateAddress: string;
  delegate: Delegate;
  blockHeight: number;
}

export class VotingPower {
  @ApiProperty({ description: 'Address for which the voting power is queried' })
  address: string;

  @ApiProperty({
    description:
      'The weight cast by the address is calculated according to the delegate relationship',
  })
  weight: number;

  @ApiProperty({
    description:
      'Actual weight of the address, ignoring the delegate relationship.',
  })
  actualWeight: number;

  @ApiProperty({
    description: 'Block number at which the voting power is queried',
  })
  blockNum: number;

  @ApiPropertyOptional({
    description: 'List of delegated voting powers',
    type: VotingPower,
    isArray: true,
  })
  delegateList?: VotingPower[];
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class GetBipVoteDto {
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
