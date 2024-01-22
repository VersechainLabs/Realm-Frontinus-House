import { Field, Int, ObjectType } from "@nestjs/graphql";
import { ApiProperty } from "@nestjs/swagger";
import { Application } from "../delegation-application/application.entity";
import {
  BeforeInsert,
  BeforeUpdate,
  Column, CreateDateColumn, DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Address } from "../types/address";
import { Exclude, instanceToPlain } from "class-transformer";
import { Community } from "src/community/community.entity";

@Entity()
@ObjectType()
export class Delegation {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All delegation are issued a unique ID number',
  })
  id: number;

  @ApiProperty()
  @Column({ default: true })
  visible: boolean;

  @ApiProperty({ description: 'The signer address' })
  @Column({ default: '' })
  @Field(() => String)
  address: Address;

  @ApiProperty()
  @Column()
  @Field(() => String)
  title: string;

  @ApiProperty({
    description: 'This is description of the delegation.',
  })
  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  // This if for list API to show "communityId" field
  @ApiProperty()
  @Column({default: 1})
  @Field(() => Number)
  communityId: number;

  // This is for migration:generate & service.ts to access DB.admin.communityId field
  @ApiProperty({ type: Number })
  @ManyToOne(() => Community, (community) => community.delegations, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => Community)
  community: Community;
  
  // @ApiProperty({ type: () => Application, isArray: true })
  @ApiProperty({ type: () => Number, isArray: true })
  @OneToMany(() => Application, (application) => application.delegation, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Application])
  applications: Application[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  @Field(() => Int)
  applicationCount: number;

  @ApiProperty()
  @CreateDateColumn()
  @Field(() => Date)
  createdDate: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'After the Start Time users may submit proposals',
  })
  startTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description: 'Users may submit proposals up until Proposal End Time',
  })
  proposalEndTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description:
      'Between Proposal End Time and Voting End Time, users may submit votes for proposals',
  })
  votingEndTime: Date;

  @ApiProperty()
  @Column()
  @Field(() => Date, {
    description:
      'Between Voting End Time and End Time, delegaters vote for users',
  })
  endTime: Date;

  @ApiProperty()
  @UpdateDateColumn({ nullable: true })
  @Field(() => Date)
  lastUpdatedDate: Date;

  @Exclude({ toPlainOnly: true })
  @DeleteDateColumn()
  @Field(() => Date)
  deletedDate?: Date;

  public isAcceptingApplications = (): boolean =>
    new Date() > this.startTime &&
    new Date() <= this.proposalEndTime &&
    this.visible == true;

  // noinspection JSUnusedGlobalSymbols : use for exclude attrs
  toJSON() {
    return instanceToPlain(this);
  }
}
