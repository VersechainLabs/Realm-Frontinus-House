import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Delegation } from 'src/delegation/delegation.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
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
