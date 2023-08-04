import {
  Community,
  StoredProposalWithVotes,
  StoredAuctionBase,
} from '@nouns/frontinus-house-wrapper/dist/builders';
import classes from './DelegateModules.module.css';
import { Col } from 'react-bootstrap';
import { DelegateVoteStatus, delegateStatus } from '../../utils/auctionStatus';
import clsx from 'clsx';
import getWinningIds from '../../utils/getWinningIds';
import DelegateUserPropCard from '../DelegateUserPropCard';
import DelegateAcceptingPropsModule from '../DelegateAcceptingPropsModule';
import TimedRoundVotingModule from '../TimedRoundVotingModule';
import RoundOverModule from '../RoundOverModule';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { isSameAddress } from '../../utils/isSameAddress';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { useAccount } from 'wagmi';
import InfRoundVotingModule from '../InfRoundVotingModule';
import { useAppSelector } from '../../hooks';
import { InfRoundFilterType } from '../../state/slices/propHouse';
import RoundModuleWinner from '../RoundModuleWinner';
import RoundModuleStale from '../RoundModuleStale';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import { isMobile } from 'web3modal';
import { infRoundBalance } from '../../utils/infRoundBalance';

const DelegateModules: React.FC<{
  auction: StoredAuctionBase;
  proposals: StoredProposalWithVotes[];
  community: Community;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { auction, proposals, community, setShowVotingModal } = props;

  const { address: account } = useAccount();
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);
  const winningIds = getWinningIds(proposals, auction);
  const [userProposals, setUserProposals] = useState<StoredProposalWithVotes[]>();

  // auction statuses
  const auctionNotStarted = delegateStatus(auction) === DelegateVoteStatus.DelegateNotStarted;
  const isProposingWindow = delegateStatus(auction) === DelegateVoteStatus.DelegateAccepting;
  const isVotingWindow = delegateStatus(auction) === DelegateVoteStatus.DelegateDelegating;
  const isRoundOver =
    delegateStatus(auction) === DelegateVoteStatus.DelegateEnd ||
    (isInfAuction(auction) && infRoundBalance(proposals, auction) === 0);

  const getVoteTotal = () => proposals.reduce((total, prop) => (total = total + prop.voteCount), 0);
  const [fetchedUserProps, setFetchedUserProps] = useState(false);

  useEffect(() => {
    if (!account || !proposals) return;
    setFetchedUserProps(false);

    // set user props
    if (proposals.some(p => isSameAddress(p.address, account))) {
      setUserProposals(
        proposals
          .filter(p => isSameAddress(p.address, account))
          .sort((a: { voteCount: any }, b: { voteCount: any }) =>
            a.voteCount < b.voteCount ? 1 : -1,
          ),
      );

      setFetchedUserProps(true);
    }
  }, [account, proposals]);

  const acceptingPropsModule = ((isTimedAuction(auction) && isProposingWindow) ||
    (isInfAuction(auction) &&
      !isRoundOver &&
      votingPower === 0 &&
      infRoundFilter === InfRoundFilterType.Active)) && (
    <DelegateAcceptingPropsModule auction={auction} community={community} />
  );

  const timedRoundVotingModule = isTimedAuction(auction) && isVotingWindow && (
    <TimedRoundVotingModule
      communityName={community.name}
      setShowVotingModal={setShowVotingModal}
      totalVotes={getVoteTotal()}
    />
  );

  const infRoundVotingModule = isInfAuction(auction) &&
    (!account || votingPower > 0) &&
    !isRoundOver &&
    infRoundFilter === InfRoundFilterType.Active && (
      <InfRoundVotingModule setShowVotingModal={setShowVotingModal} />
    );

  const roundWinnerModule = isInfAuction(auction) &&
    !isRoundOver &&
    infRoundFilter === InfRoundFilterType.Winners && <RoundModuleWinner auction={auction} />;

  const roundStaleModule = isInfAuction(auction) && infRoundFilter === InfRoundFilterType.Stale && (
    <RoundModuleStale auction={auction} />
  );

  const roundOverModule = isRoundOver && (
    <RoundOverModule
      numOfProposals={proposals.length}
      totalVotes={getVoteTotal()}
      round={auction}
    />
  );

  const userPropCardModule = (isInfAuction(auction)
    ? infRoundFilter === InfRoundFilterType.Active
    : true) &&
    !auctionNotStarted &&
    account &&
    userProposals &&
    userProposals.length > 0 &&
    fetchedUserProps && (
      <DelegateUserPropCard
        userProps={userProposals}
        proposals={proposals}
        numOfWinners={0}
        status={delegateStatus(auction)}
        winningIds={winningIds && winningIds}
      />
    );


  const modules = [
    acceptingPropsModule,
    roundStaleModule,
    roundOverModule,
  ];

  return (
    <Col xl={4} className={clsx(classes.sideCards, classes.breakOut)}>
      {isMobile() ? (
        <Swiper slidesPerView={1} className={classes.swiper}>
          {modules.map(
            (module, index) =>
              React.isValidElement(module) && (
                <SwiperSlide style={{ paddingLeft: '24px', paddingRight: '24px' }} key={index}>
                  {module}
                </SwiperSlide>
              ),
          )}
        </Swiper>
      ) : (
        modules.map(m => m)
      )}
    </Col>
  );
};
export default DelegateModules;
