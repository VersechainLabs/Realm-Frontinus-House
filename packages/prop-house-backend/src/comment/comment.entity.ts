import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsEthereumAddress } from 'class-validator';
import { Community } from 'src/community/community.entity';
import { SignedDataPayload, SignedEntity } from 'src/entities/signed';
import { Proposal } from 'src/proposal/proposal.entity';
import { Address } from 'src/types/address';
import { SignatureState } from 'src/types/signature';
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
export class Comment {
  @PrimaryGeneratedColumn()
  @Field(() => Int, {
    description: 'All delegate are issued a unique ID number',
  })
  id: number;

  @Column({ default: true })
  visible: boolean;

  

  @Column()
  @IsEthereumAddress()
  @Field(() => String)
  address: Address;

  @Column('varchar', {
    length: 60,
    nullable: false,
    default: SignatureState.VALIDATED,
  })
  @Field(() => String)
  signatureState: SignatureState;

  @Column({ type: 'jsonb' })
  @Field(() => SignedDataPayload)
  signedData: SignedDataPayload;



  @Column()
  @Field(() => String)
  content: string;

  // @Column({})
  // @Field(() => String)
  // address: string;

  
  @ManyToOne(() => Proposal)
  @JoinColumn()
  @Field(() => Proposal)
  proposal: Proposal;

  @Column({})
//   @RelationId((comment: Comment) => comment.proposal)
  proposalId: number;

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

//   public isAcceptingProposals = (): boolean =>
//     new Date() > this.startTime && new Date() <= this.proposalEndTime;
}

// @InputType()
// export class AuctionInput extends Auction {}
