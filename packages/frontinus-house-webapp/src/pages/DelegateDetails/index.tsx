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
import { nameToSlug, slugToName } from '../../utils/communitySlugs';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import ReactMarkdown from 'react-markdown';
import ProposalModal from '../../components/ProposalModal';
import { useSigner } from 'wagmi';
import LoadingIndicator from '../../components/LoadingIndicator';
import NotFound from '../../components/NotFound';
import { isMobile } from 'web3modal';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { infRoundBalance } from '../../utils/infRoundBalance';
import DelegateUtilityBar from "../../components/DelegateUtilityBar";

const DelegateDetails = () => {
  const location = useLocation();
  // const communityName = location.pathname.substring(1).split('/')[0];

  const communityName = 'frontinus';


  const id = location.pathname.substring(1).split('/')[1];

  const dispatch = useAppDispatch();
  const { data: signer } = useSigner();
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

  const [loadingRound, setLoadingRound] = useState(false);
  const [loadingComm, setLoadingComm] = useState(false);
  const [loadingCommFailed, setLoadingCommFailed] = useState(false);
  const [roundfailedFetch, setRoundFailedFetch] = useState(false);

  const [loadingProps, setLoadingProps] = useState(false);
  const [propsFailedFetch, setPropsFailedFetch] = useState(false);

  useEffect(() => {
    client.current = new ApiWrapper(host, signer);
  }, [signer, host]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (community) return;

    const fetchCommunity = async () => {
      try {
        setLoadingComm(true);
        const community = await client.current.getCommunityWithId(1);
        dispatch(setActiveCommunity(community));

        setLoadingComm(false);
      } catch (e) {
        setLoadingComm(false);
        setLoadingCommFailed(true);
      }
    };

    fetchCommunity();
  }, [communityName, dispatch, id, round, community]);

  // if no data is found in store (ie round page is entry point), fetch data
  useEffect(() => {
    if (round || !community) return;

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
  }, [communityName, dispatch, id, round, community]);

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
            <Container>
              <DelegateHeader auction={round} community={community} />
            </Container>
            <div className={classes.stickyContainer}>
              <Container>
                <DelegateUtilityBar auction={round} />
              </Container>
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
