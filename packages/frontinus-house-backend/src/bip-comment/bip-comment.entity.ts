import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';
import { BipRound } from 'src/bip-round/bip-round.entity';

@Entity()
@ObjectType()
export class BipComment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All comments are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @ApiProperty()
  @Column()
  @Field(() => String)
  content: string;

  @ApiProperty()
  @Column({})
  @Field(() => String)
  address: string;

  // @ApiProperty({ type: () => Auction })
  @ManyToOne(() => BipRound, (bipRound) => bipRound.comments, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => BipRound)
  bipRound: BipRound;


  @ApiProperty({
    description: 'The unique ID of the related proposal',
    required: false,
  })
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  bipRoundId: number;

  @ApiProperty()
  @CreateDateColumn()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  @Field(() => Date)
  deletedDate?: Date;

  // noinspection JSUnusedGlobalSymbols : use for exclude attrs
  toJSON() {
    return instanceToPlain(this);
  }
}
