import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

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
