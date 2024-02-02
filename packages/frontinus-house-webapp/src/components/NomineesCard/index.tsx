import classes from './NomineesCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import VotingControls from '../VotingControls';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import NomineesVotesDisplay from '../NomineesVotesDisplay';
import { useAppSelector } from '../../hooks';
import {getSlug, nameToSlug} from '../../utils/communitySlugs';
import { useDispatch } from 'react-redux';
import {
  InfRoundFilterType,
  setActiveProposal,
  setModalActive,
} from '../../state/slices/delegate';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import { BiAward } from 'react-icons/bi';
import Divider from '../Divider';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import React, { useEffect, useState } from 'react';
import { isTimedAuction } from '../../utils/auctionType';
import { isMobile } from 'web3modal';
import {useLocation, useNavigate} from "react-router-dom";
import TruncateThousands from "../TruncateThousands";

const NomineesCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  isWinner: boolean;
  stale?: boolean;
}> = props => {
  const { proposal, auctionStatus, cardStatus, isWinner, stale } = props;

  const community = useAppSelector(state => state.delegate.activeCommunity);
  const round = useAppSelector(state => state.delegate.activeRound);
  const infRoundFilter = useAppSelector(state => state.delegate.infRoundFilterType);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const roundIsActive = () =>
    auctionStatus === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus === AuctionStatus.AuctionVoting;

  const showVotesSection =
    round && isTimedAuction(round)
      ? auctionStatus === AuctionStatus.AuctionVoting ||
        auctionStatus === AuctionStatus.AuctionEnded
      : infRoundFilter === InfRoundFilterType.Active;

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
  const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();

  useEffect(() => {
    let imgUrl;

    const getImg = async () => {
      // imgUrl = await getFirstImageFromProp(proposal);
      imgUrl = proposal.previewImage;
      if ( imgUrl){
        setImgUrlFromProp(imgUrl);
      }
      setDisplayTldr(!isMobile() || (isMobile() && !imgUrl));
    };
    getImg();
  }, [proposal]);

  return (
    <>
      <div
        onClick={e => {
          if (!proposal) return;

          if (cmdPlusClicked(e)) {
            navigate('/' + getSlug(location.pathname) + `/application/${(proposal.id)}-${nameToSlug(proposal.title)}`)
            return;
          }
          navigate('/' + getSlug(location.pathname) + `/application/${(proposal.id)}-${nameToSlug(proposal.title)}`)
          // dispatch(setModalActive(true));
          // dispatch(setActiveProposal(proposal));
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(
            classes.proposalCard,
            stale && classes.stale,
          )}
        >
          <div className={classes.propInfo}>
            <div className={classes.textContainter}>
              <div>
                <div className={classes.titleContainer}>
                  <div className={classes.propTitle}>{proposal.title}</div>
                </div>

                {displayTldr && (
                  <ReactMarkdown
                    className={classes.truncatedTldr}
                    children={proposal.tldr}
                    disallowedElements={['img', '']}
                    components={{
                      h1: 'p',
                      h2: 'p',
                      h3: 'p',
                    }}
                  />
                )}
              </div>
            </div>

            {imgUrlFromProp && (
              <div className={classes.propImgContainer}>
                <img src={imgUrlFromProp} alt="propCardImage" />
              </div>
            )}
          </div>

          <Divider narrow />

          <div className={classes.submissionInfoContainer}>
            <div className={classes.addressAndTimestamp}>
              <EthAddress address={proposal.address} className={classes.truncate} addAvatar />


              <span className={classes.weights}>
                (
                <TruncateThousands amount={proposal.actualWeight} />
                &nbsp;{community && community.nftName})
              </span>
·
              {proposal.lastUpdatedDate !== null ? (
                <Tooltip
                  content={
                    <div
                      className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                      title={detailedTime(proposal.createdDate)}
                    >
                      {diffTime(proposal.createdDate)}

                      <span className="infoSymbol">
                        <MdInfoOutline />
                      </span>
                    </div>
                  }
                  tooltipContent={`edited ${diffTime(proposal.lastUpdatedDate)}`}
                />
              ) : (
                <div
                  className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                  title={detailedTime(proposal.createdDate)}
                >
                  {diffTime(proposal.createdDate)}
                </div>
              )}
              {proposal.reqAmount && (
                <>
                  {' '}
                  <span className={clsx(classes.bullet, roundIsActive() && classes.hideDate)}>
                    {' • '}
                  </span>
                  <div
                    className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                    title={detailedTime(proposal.createdDate)}
                  >
                    <BiAward />
                    {`${proposal.reqAmount} ${round?.currencyType}`}
                  </div>
                </>
              )}
            </div>


              <div className={classes.timestampAndlinkContainer}>
                <div className={clsx(classes.avatarAndPropNumber)}>
                  <div className={classes.voteCountCopy} title={detailedTime(proposal.createdDate)}>
                    <NomineesVotesDisplay proposal={proposal} />
                  </div>
                </div>
              </div>

          </div>
        </Card>
      </div>
    </>
  );
};

export default NomineesCard;
