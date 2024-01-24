import classes from './DelegateCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  deadlineCopy,
  deadlineTime,
  delegateStatus,
  DelegateVoteStatus,
  delegateDeadlineCopy,
  delegateDeadlineTime,
} from '../../utils/auctionStatus';
import {useLocation, useNavigate} from 'react-router-dom';
import StatusPill from '../StatusPill';
import {getSlug, nameToSlug} from '../../utils/communitySlugs';
import diffTime from '../../utils/diffTime';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';
import dayjs from 'dayjs';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppDispatch } from '../../hooks';
import { setActiveRound } from '../../state/slices/propHouse';
import TruncateThousands from '../TruncateThousands';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { countDecimals } from '../../utils/countDecimals';
import StatusDelegate from '../StatusDelegate';

const DelegateCard: React.FC<{
  round: any;
  isActive: boolean;
}> = props => {
  const { round,isActive } = props;
  const { t } = useTranslation();
  let navigate = useNavigate();
  const dispatch = useAppDispatch();
  const location = useLocation();
  interface changeTagProps {
    children: React.ReactNode;
  }

  // overrides any tag to become a <p> tag
  const changeTagToParagraph = ({ children }: changeTagProps) => <p>{children}</p>;

  // overrides any tag to become a <span> tag
  const changeTagToSpan = ({ children }: changeTagProps) => <span>{children}</span>;

  return (
    <>
      <div
        onClick={e => {
          // dispatch(setActiveRound(round));
          if (cmdPlusClicked(e)) {
            openInNewTab(`${window.location.href}/delegateDetails/${round.id}`);
            return;
          }
          // navigate(`${nameToSlug(round.title)}`);

          navigate('/' + getSlug(location.pathname) + `/delegateDetails/${round.id}-${nameToSlug(round.title)}`);
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            delegateStatus(round) === DelegateVoteStatus.DelegateEnd && classes.roundEnded,
            classes.roundCard,
          )}
        >
          <div className={classes.textContainer}>
            <div className={classes.titleContainer}>
              <div className={classes.authorContainer}>{round.title}</div>
              <StatusDelegate status={delegateStatus(round)} />
            </div>

            {/* support both markdown & html in round's description.  */}
            <Markdown
              className={classes.truncatedTldr}
              options={{
                overrides: {
                  h1: changeTagToParagraph,
                  h2: changeTagToParagraph,
                  h3: changeTagToParagraph,
                  a: changeTagToSpan,
                  br: changeTagToSpan,
                },
              }}
            >
              {sanitizeHtml(round.description)}
            </Markdown>
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>Delegation Period</p>
              <p className={classes.info}>
                {isActive ? (<span>
                  <span className="">{dayjs(round.startTime).tz().format('MMM D')} </span> ~
                  <span> {dayjs(round.endTime).tz().format('MMM D')}</span>
                </span>) : (<span>
                  <span className="">{dayjs(round.startTime).tz().format('MMM D, YYYY')}</span>~
                  <span>{dayjs(round.endTime).tz().format('MMM D, YYYY')}</span>
                </span>)}

              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <Tooltip
                content={
                  <>
                    <p className={classes.title}>
                      {isInfAuction(round) ? 'Quorum' : delegateDeadlineCopy(round)}
                    </p>
                    <p className={classes.info}>
                      {isInfAuction(round)
                        ? round.quorum
                        : diffTime(delegateDeadlineTime(round)).replace('months', 'mos')}{' '}
                    </p>
                  </>
                }
                tooltipContent={
                  isInfAuction(round)
                    ? `The number of votes required for a prop to be funded`
                    : `${dayjs(delegateDeadlineTime(round)).tz().format('MMMM D, YYYY h:mm A')}`
                }
              />
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}>Applications</p>
              <p className={classes.info}>
                {round.applications ? round.applications.length : round.applicationCount}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default DelegateCard;
