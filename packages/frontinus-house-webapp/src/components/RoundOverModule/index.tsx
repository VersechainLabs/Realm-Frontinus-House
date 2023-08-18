import { StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { isTimedAuction } from '../../utils/auctionType';
import RoundModuleCard from '../RoundModuleCard';
import classes from './RoundOverModule.module.css';
import VotesCard from "../VotesCard";

export interface RoundOverModuleProps {
  totalVotes: number | undefined;
  numOfProposals: number;
  round: StoredAuctionBase;
}

const RoundOverModule: React.FC<RoundOverModuleProps> = (props: RoundOverModuleProps) => {
  const { numOfProposals, totalVotes, round } = props;
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
    />
  ) : (
    <VotesCard
      title={'Round has ended'}
      subtitle={<>No awards remaining</>}
      content={<>{`${totalVotes} votes were casted to award ${numOfProposals} proposals`}</>}
      type="winner"
    />
  );
};

export default RoundOverModule;
