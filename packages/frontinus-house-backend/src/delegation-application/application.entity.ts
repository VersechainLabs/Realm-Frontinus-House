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
export class Application {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All applications are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  @ApiProperty()
  @Column()
  @Field(() => String)
  address: string;

  //   @Column()
  //   @Field(() => String)
  //   signedData: string;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

  @ApiProperty()
  @Column()
  @Field(() => String)
  tldr: string;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @ApiProperty({ type: () => Delegation, isArray: true })
  @ManyToOne(() => Delegation, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Delegation)
  delegation: Delegation;

  @Column({})
  delegationId: number;

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  delegatorCount: number;

  @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Column({ nullable: true })
  @Field(() => Date)
  deletedAt: Date;

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
