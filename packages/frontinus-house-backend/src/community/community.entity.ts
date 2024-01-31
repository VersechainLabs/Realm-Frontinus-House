import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { Auction } from '../auction/auction.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  JoinColumn,
  BeforeInsert,
  BeforeUpdate,
  RelationId,
} from 'typeorm';
import { BipRound } from 'src/bip-round/bip-round.entity';
import { Admin } from 'src/admin/admin.entity';
import { Delegation } from 'src/delegation/delegation.entity';

@Entity()
@ObjectType()
export class Community {
  @PrimaryGeneratedColumn()
  @Field(() => Int)
  id: number;

  @Column({ default: true })
  visible: boolean;

  @Column()
  @Field(() => String, {
    description: 'The contract address that is queried for balances',
  })
  contractAddress: string;

  @Column()
  @Field(() => String)
  name: string;

  @Column()
  @Field(() => String)
  profileImageUrl: string;

  @Column({ nullable: true })
  @Field(() => String)
  description: string;

  @Column({ default: null })
  @Field(() => String)
  nftName: string;

  @Column({ default: null })
  @Field(() => String)
  discordLink: string;

  @Column({ default: null })
  @Field(() => String)
  twLink: string;

  @Column({ default: null })
  @Field(() => String)
  gitLink: string;

  @Column({ default: null })
  @Field(() => String)
  manualLink: string;

  @Field(() => Int)
  numAuctions: number;

  @OneToMany(() => Auction, (auction) => auction.community, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Auction])
  auctions: Auction[];

  @OneToMany(() => BipRound, (bipRound) => bipRound.community, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [BipRound])
  bipRounds: BipRound[];

  @OneToMany(() => Admin, (admin) => admin.community, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Admin])
  admins: Admin[];

  @OneToMany(() => Delegation, (delegation) => delegation.community, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn()
  @Field(() => [Delegation])
  delegations: Delegation[];


  @Column()
  @Field(() => Date)
  createdDate: Date;

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

@InputType()
export class CommunityInput extends PartialType(Community) {}
