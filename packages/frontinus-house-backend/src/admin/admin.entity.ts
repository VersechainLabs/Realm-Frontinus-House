import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Community } from 'src/community/community.entity';
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

  // This if for list API to show "communityId" field
  @ApiProperty()
  @Column()
  @Field(() => Number)
  communityId: number;

  // This is for migration:generate & service.ts to access DB.admin.communityId field
  @ApiProperty({ type: Number })
  @ManyToOne(() => Community, (community) => community.admins, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Community)
  community: Community;


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
