import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, instanceToPlain } from 'class-transformer';

@Entity()
@ObjectType()
export class Delegate {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All delegates are issued a unique ID number',
  })
  id: number;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  delegationId: number;

  @ApiProperty()
  @Column()
  @Field(() => Int)
  applicationId: number;

  @ApiProperty()
  @Column()
  @Field(() => String)
  fromAddress: string;

  @ApiProperty()
  @Column()
  @Field(() => String)
  toAddress: string;

  @ApiProperty()
  @CreateDateColumn()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @UpdateDateColumn()
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  @Field(() => Date)
  deletedDate?: Date;

  @BeforeInsert()
  setCreatedDate() {
    this.createdDate = new Date();
  }

  @BeforeUpdate()
  setUpdatedDate() {
    this.lastUpdatedDate = new Date();
  }

  // noinspection JSUnusedGlobalSymbols : use for exclude attrs
  toJSON() {
    return instanceToPlain(this);
  }
}
