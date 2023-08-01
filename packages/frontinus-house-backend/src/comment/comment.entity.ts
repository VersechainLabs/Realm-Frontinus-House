import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Proposal } from 'src/proposal/proposal.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Application } from '../delegation-application/application.entity';

@Entity()
@ObjectType()
export class Comment {
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
  owner: string;

  @ApiProperty({
    description: 'The unique ID of the related proposal',
    required: false,
  })
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  proposalId?: number;

  @ApiProperty({
    description: 'The unique ID of the related application',
    required: false,
  })
  @Column({ nullable: true })
  @Field(() => Int, { nullable: true })
  applicationId?: number;

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
