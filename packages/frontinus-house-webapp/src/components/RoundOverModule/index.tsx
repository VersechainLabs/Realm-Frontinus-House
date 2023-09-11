import {StoredAuctionBase, StoredProposalWithVotes} from '@nouns/frontinus-house-wrapper/dist/builders';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { isTimedAuction } from '../../utils/auctionType';
import RoundModuleCard from '../RoundModuleCard';
import classes from './RoundOverModule.module.css';
import VotesCard from "../VotesCard";
import {AuctionStatus} from "../../utils/auctionStatus";
import React from "react";

export interface RoundOverModuleProps {
  totalVotes: number | undefined;
  numOfProposals: number;
  round: StoredAuctionBase;
  showFlag: boolean;
  userProps: StoredProposalWithVotes[];
  status: AuctionStatus;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
  winningIds: number[];
}

const RoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes, round, showFlag, userProps, winningIds, proposals, status, numOfWinners } = props;
  const { t } = useTranslation();

  const content = (
    <p className={clsx(classes.sideCardBody, classes.winnersText)}>
      {t('winnersAreHighlightedIn')} <span className={classes.greenText}>{t('green')}</span>.
    </p>
  );

  return isTimedAuction(round) ? (
    <VotesCard
      title={t('votingEnded')}
      subtitle={
        <>
          {totalVotes?.toFixed()} {Number(totalVotes?.toFixed()) === 1 ? t('vote') : t('votes')}{' '}
          {t('castFor')} {numOfProposals} {numOfProposals === 1 ? t('prop') : t('props')}!
        </>
      }
      content={content}
      type="ended"
      showFlag={showFlag}
      userProps={userProps}
      proposals={proposals}
      numOfWinners={numOfWinners}
      status={status}
      winningIds={winningIds}
    />
  ) : (
    <VotesCard
      title={'Round has ended'}
      subtitle={<>No awards remaining</>}
      content={<>{`${totalVotes} votes were casted to award ${numOfProposals} proposals`}</>}
      type="winner"
      showFlag={showFlag}
      userProps={userProps}
      proposals={proposals}
      numOfWinners={numOfWinners}
      status={status}
      winningIds={winningIds}
    />
  );
};

export default RoundOverModule;
