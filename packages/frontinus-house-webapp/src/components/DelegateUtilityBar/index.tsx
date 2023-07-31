import classes from './DelegateUtilityBar.module.css';
import clsx from 'clsx';
import {
  delegateStatus,
  DelegateVoteStatus,
  delegateDeadlineCopy,
  delegateDeadlineTime,
} from '../../utils/auctionStatus';
import diffTime from '../../utils/diffTime';
import SortToggles from '../SortToggles';
import { StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useAppSelector } from '../../hooks';
import TruncateThousands from '../TruncateThousands';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { countDecimals } from '../../utils/countDecimals';
import { timestampToDateUnit } from '../../utils/timestampToDateUnit';
import {
  RoundUtilBarItem,
  RoundUtilBarItemBalance,
  RoundUtilBarItemTooltip,
} from '../RoundUtilBarItem';
import { infRoundBalance } from '../../utils/infRoundBalance';

export interface RoundUtilityBarProps {
  auction: any;
}

const DelegateUtilityBar = ({ auction }: RoundUtilityBarProps) => {
  const proposals = useAppSelector(state => state.delegate.activeProposals);
  const community = useAppSelector(state => state.delegate.activeCommunity);

  const { t } = useTranslation();

  return (
    <div className={classes.roundUtilityBar}>

      {/** ROUND DATA */}
      <div className={classes.utilitySection}>
        <Col
          className={clsx(
            classes.propHouseDataRow,
            isInfAuction(auction) ? classes.hideFourthItemOnMobile : classes.hideThirdItemOnMobile,
          )}
        >
          {/** TIMED AUCTION */}
          {isTimedAuction(auction) && (
            <>
              {/** PROP DEADLINE  */}
              <RoundUtilBarItemTooltip
                title={delegateDeadlineCopy(auction)}
                content={diffTime(delegateDeadlineTime(auction))}
                tooltipContent={`${dayjs(delegateDeadlineTime(auction))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
                titleColor="purple"
              />
            </>
          )}

          {/** INF AUCTION */}
          {isInfAuction(auction) && (
            <>
              {/** QUORUM */}
              <RoundUtilBarItemTooltip
                title="Quorum"
                content={`${auction.quorum} votes`}
                tooltipContent={'Votes required to get funded'}
              />

              {/** VOTING PERIOD */}
              <RoundUtilBarItemTooltip
                title="Voting period"
                content={timestampToDateUnit(auction.votingPeriod)}
                tooltipContent={'Period of time each prop has to achieve quorum'}
                titleColor="purple"
              />

              {/**  BALANCE  */}
              <RoundUtilBarItemBalance
                content={
                  <>
                    <TruncateThousands
                      amount={
                        isInfAuction(auction) && proposals ? infRoundBalance(proposals, auction) : 0
                      }
                      decimals={countDecimals(auction.fundingAmount) === 3 ? 3 : 2}
                    />{' '}
                    {auction.currencyType}
                  </>
                }
                progress={
                  isInfAuction(auction) && proposals ? infRoundBalance(proposals, auction) : 0
                }
              />
            </>
          )}

          {/** NUMBER OF PROPS */}
          {proposals && (
            <RoundUtilBarItem
              title={proposals.length === 1 ? t('application') : t('applications')}
              content={proposals.length.toString()}
            />
          )}
        </Col>
      </div>
    </div>
  );
};

export default DelegateUtilityBar;
