import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Delegation } from '../delegation/delegation.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => String)
  previewImage: string;

  // @ApiProperty({ type: () => Delegation, isArray: true })
  @ManyToOne(() => Delegation, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Delegation)
  delegation: Delegation;

  @ApiProperty()
  @Column({})
  delegationId: number;

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  delegatorCount: number;

  @ApiProperty({
    description: 'The comment count about this proposal',
  })
  @Column({ type: 'integer', default: 0 })
  commentCount: number;

  @ApiProperty({
    description:
      'The user actually owns the weight, ignoring the delegate relationship.',
  })
  @Column({ default: 0 })
  @Field(() => Int)
  actualWeight: number;

  @ApiProperty()
  @Column({ default: null })
  @Field(() => Int)
  blockHeight: number;

  @ApiProperty({
    description:
      'All the delegate actualWeight of this application',
  })
  @Column({ default: 0 })
  @Field(() => Int)
  sumWeight: number;

  @ApiProperty()
  @Column()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  @Field(() => Date)
  deletedAt: Date;

  @ApiProperty({
    description:
      'Indicates how the frontend should react based on this code.',
    type: Object,
  })
  voteState: { code: number; canVote: boolean; reason: string; };

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
