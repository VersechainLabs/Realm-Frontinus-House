import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import RoundHeader from '../../components/RoundHeader';
import DelegateHeader from '../../components/DelegateHeader';
import { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import {
  filterInfRoundProposals,
  InfRoundFilterType,
  setActiveCommunity,
  setActiveProposals,
  setActiveRound,
  setInfRoundFilterType,
  setModalActive,
  sortTimedRoundProposals,
  TimedRoundSortType,
} from '../../state/slices/delegate';
import { Container } from 'react-bootstrap';
import classes from './DelegateDetails.module.css';
import DelegateContent from '../../components/DelegateContent';
import {getSlug, nameToSlug, slugToName} from '../../utils/communitySlugs';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import ReactMarkdown from 'react-markdown';
import ProposalModal from '../../components/ProposalModal';
import { useWalletClient } from 'wagmi';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { infRoundBalance } from '../../utils/infRoundBalance';
import DelegateUtilityBar from "../../components/DelegateUtilityBar";
import clsx from "clsx";
import dayjs from "dayjs";
import formatTimeAll from "../../utils/formatTimeAll";
import {useParams} from "react-router";

const DelegateDetails = () => {
  const location = useLocation();
  const communityName = getSlug(location.pathname);

  const params = useParams();
  const { idParam, title } = params;
  const id = idParam.split('-')[0];
  const dispatch = useAppDispatch();
  const { data: walletClient } = useWalletClient();
  const community = useAppSelector(state => state.delegate.activeCommunity);
  const round = useAppSelector(state => state.delegate.activeRound);
  const proposals = useAppSelector(state => state.delegate.activeProposals);
  const infRoundFilteredProposals = useAppSelector(
    state => state.delegate.infRoundFilteredProposals,
  );
  const host = useAppSelector(state => state.configuration.backendHost);
  const modalActive = useAppSelector(state => state.delegate.modalActive);
  const client = useRef(new ApiWrapper(host));

  const isRoundOver = round && auctionStatus(round) === AuctionStatus.AuctionEnded;
  const isVotingWindow = round && auctionStatus(round) === AuctionStatus.AuctionVoting;
  const _now = dayjs();

  const [loadingRound, setLoadingRound] = useState(false);
  const [loadingComm, setLoadingComm] = useState(false);
  const [loadingCommFailed, setLoadingCommFailed] = useState(false);
  const [roundfailedFetch, setRoundFailedFetch] = useState(false);

  const [loadingProps, setLoadingProps] = useState(false);
  const [propsFailedFetch, setPropsFailedFetch] = useState(false);

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (!community) {
      const fetchCommunity = async () => {
        try {
          setLoadingComm(true);
          const community = await client.current.getCommunityWithName(communityName);
          dispatch(setActiveCommunity(community));

          setLoadingComm(false);
        } catch (e) {
          setLoadingComm(false);
          setLoadingCommFailed(true);
        }
      };
      fetchCommunity();
    }

    if (!round && !loadingRound) {
      const fetchRound = async () => {
        try {
          setLoadingRound(true);

          const round = await client.current.getDelegateDetails(
              parseInt( id ),
          );
          dispatch(setActiveRound(round));
          setLoadingRound(false);
        } catch (e) {
          setLoadingRound(false);
          setRoundFailedFetch(true);
        }
      };

      fetchRound();
    }


  }, [communityName, dispatch, id, round, community]);

  // if no data is found in store (ie round page is entry point), fetch data
  // useEffect(() => {
  //
  //
  // }, [dispatch, id]);

  // fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      try {
        setLoadingProps(true);

        // const proposals = await client.current.getNominessByDelegate(round.id);
        const proposals = await client.current.getNominessByDelegate(parseInt( id ));
        dispatch(setActiveProposals(proposals));

        // set initial state for props (sorted in timed round / filtered in inf round)
        if (isTimedAuction(round)) {
          // dispatch(
          //   sortTimedRoundProposals({
          //     sortType:
          //       isVotingWindow || isRoundOver
          //         ? TimedRoundSortType.VoteCount
          //         : TimedRoundSortType.CreatedAt,
          //     ascending: false,
          //   }),
          // );
          dispatch(
            sortTimedRoundProposals({
              sortType: TimedRoundSortType.CreatedAt,
              ascending: false,
            }),
          );
        } else {
          const infRoundOver = infRoundBalance(proposals, round) === 0;
          const filterType = infRoundOver ? InfRoundFilterType.Winners : InfRoundFilterType.Active;
          dispatch(setInfRoundFilterType(filterType));
          dispatch(filterInfRoundProposals({ type: filterType, round }));
        }

        setLoadingProps(false);
      } catch (e) {
        console.log(e);
        setLoadingProps(false);
        setPropsFailedFetch(true);
      }
    };

    fetchAuctionProposals();

    return () => {
      dispatch(setInfRoundFilterType(InfRoundFilterType.Active));
      dispatch(setModalActive(false));
      dispatch(setActiveCommunity(undefined));
      dispatch(setActiveRound(undefined));
      dispatch(setActiveProposals([]));
    };
  }, [dispatch, isVotingWindow, isRoundOver, round]);

  return (
    <>
      {modalActive && <ProposalModal />}

      {round && (
        <OpenGraphElements
          title={round.title}
          description={markdownComponentToPlainText(<ReactMarkdown children={round.description} />)}
          imageUrl={cardServiceUrl(CardType.round, round.id).href}
        />
      )}

      {loadingComm || loadingRound ? (
        <LoadingIndicator height={isMobile() ? 416 : 332} />
      ) : loadingCommFailed || roundfailedFetch ? (
        <NotFound />
      ) : (
        community &&
        round && (
          <>

            <div className={classes.topTimeBg}>
              <Container>
                {round && (<div className={classes.topTimeMain}>
                  <div className={classes.timeMain}>
                    <div className={clsx(classes.timeXianWidth1,_now.isAfter(dayjs(round.startTime)) && classes.timeXianColor1)}>

                    </div>
                    {_now.isAfter(dayjs(round.startTime)) && (<div className={classes.timeQiu}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.91276 5.32339L7.22314 9.17197L5.85053 10.7073L1.54015 6.85868L2.91276 5.32339ZM4.75435 8.82392L10.6864 2.24676L12.2168 3.62517L6.28468 10.2023L4.75435 8.82392Z" fill="#0B090E"/>
                      </svg>
                    </div>)}
                    {_now.isBefore(dayjs(round.startTime)) && ( <div className={classes.timeQiu2}>
                      <div className={classes.timeQiu3}>

                      </div>
                    </div>)}

                    <div className={clsx(classes.timeXianWidth2,_now.isAfter(dayjs(round.proposalEndTime)) && classes.timeXianColor1)}>

                    </div>
                    {_now.isAfter(dayjs(round.proposalEndTime)) && (<div className={classes.timeQiu}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.91276 5.32339L7.22314 9.17197L5.85053 10.7073L1.54015 6.85868L2.91276 5.32339ZM4.75435 8.82392L10.6864 2.24676L12.2168 3.62517L6.28468 10.2023L4.75435 8.82392Z" fill="#0B090E"/>
                      </svg>
                    </div>)}
                    {_now.isBefore(dayjs(round.proposalEndTime)) && ( <div className={classes.timeQiu2}>
                      <div className={classes.timeQiu3}>

                      </div>
                    </div>)}
                    <div className={clsx(classes.timeXianWidth2,_now.isAfter(dayjs(round.votingEndTime)) && classes.timeXianColor1)}>

                    </div>
                    {_now.isAfter(dayjs(round.votingEndTime)) && (<div className={classes.timeQiu}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.91276 5.32339L7.22314 9.17197L5.85053 10.7073L1.54015 6.85868L2.91276 5.32339ZM4.75435 8.82392L10.6864 2.24676L12.2168 3.62517L6.28468 10.2023L4.75435 8.82392Z" fill="#0B090E"/>
                      </svg>
                    </div>)}
                    {_now.isBefore(dayjs(round.votingEndTime)) && ( <div className={classes.timeQiu2}>
                      <div className={classes.timeQiu3}>

                      </div>
                    </div>)}
                    <div className={clsx(classes.timeXianWidth2,_now.isAfter(dayjs(round.endTime)) && classes.timeXianColor1)}>

                    </div>
                    {_now.isAfter(dayjs(round.endTime)) && (<div className={classes.timeQiu}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.91276 5.32339L7.22314 9.17197L5.85053 10.7073L1.54015 6.85868L2.91276 5.32339ZM4.75435 8.82392L10.6864 2.24676L12.2168 3.62517L6.28468 10.2023L4.75435 8.82392Z" fill="#0B090E"/>
                      </svg>
                    </div>)}
                    {_now.isBefore(dayjs(round.endTime)) && ( <div className={classes.timeQiu2}>
                      <div className={classes.timeQiu3}>

                      </div>
                    </div>)}
                    <div className={clsx(classes.timeXianWidth1,_now.isAfter(dayjs(round.endTime)) && classes.timeXianColor1)}>

                    </div>
                  </div>
                  <div className={classes.textMain}>
                    <div className={classes.textMargin1}>
                      <div className={clsx(classes.text1,_now.isAfter(dayjs(round.startTime)) && classes.textColor2)}>
                        Accepting Applicant
                      </div>
                      <div className={classes.text2}>
                        {formatTimeAll(round.startTime)}
                      </div>
                    </div>
                    <div className={classes.textMargin2} >
                      <div className={clsx(classes.text1,_now.isAfter(dayjs(round.proposalEndTime)) && classes.textColor2)}>
                        Start Delegating
                      </div>
                      <div className={classes.text2}>
                        {formatTimeAll(round.proposalEndTime)}
                      </div>
                    </div>
                    <div className={classes.textMargin3}>
                      <div className={clsx(classes.text1,_now.isAfter(dayjs(round.votingEndTime)) && classes.textColor2)}>
                        Delegation Granted

                      </div>
                      <div className={classes.text2}>
                        {formatTimeAll(round.votingEndTime)}
                      </div>
                    </div>
                    <div className={classes.textMargin4}>
                      <div className={clsx(classes.text1,_now.isAfter(dayjs(round.endTime)) && classes.textColor2)}>
                        Delegation Ended

                      </div>
                      <div className={classes.text2}>
                        {formatTimeAll(round.endTime)}
                      </div>
                    </div>
                  </div>
                </div>)}
              </Container>
            </div>

            <div className={'bgTop'}>
              <Container>
                <DelegateHeader auction={round} community={community} />
              </Container>
              <div className={classes.stickyContainer}>
                <Container>
                  <DelegateUtilityBar auction={round} />
                </Container>
              </div>
            </div>

          </>
        )
      )}


      <div className={classes.roundContainer}>
        <Container className={classes.cardsContainer}>
          <div className={classes.propCards}>
            {loadingProps ? (
                <div className={classes.loader}>
                  <LoadingIndicator />
                </div>
            ) : propsFailedFetch ? (
                <NotFound />
            ) : (
                round && (
                    <DelegateContent
                        auction={round}
                        proposals={
                          isInfAuction(round)
                              ? infRoundFilteredProposals
                              ? infRoundFilteredProposals
                              : []
                              : proposals
                              ? proposals
                              : []
                        }
                    />
                )
            )}
          </div>
        </Container>
      </div>

    </>
  );
};

export default DelegateDetails;
