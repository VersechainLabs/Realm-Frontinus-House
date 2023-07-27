import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Community } from 'src/community/community.entity';
import { Delegation } from 'src/delegation/delegation.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  RelationId,
} from 'typeorm';
// import { AuctionBase } from './auction-base.type';

@Entity()
@ObjectType()
export class Admin {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All applications are issued a unique ID number',
  })
  id: number;

  @ApiProperty()
  @Column()
  @Field(() => String)
  address: string;

  @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }
}

// @InputType()
// export class AuctionInput extends Auction {}
