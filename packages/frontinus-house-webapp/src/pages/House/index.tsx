import classes from './House.module.css';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';
import HouseHeader from '../../components/HouseHeader';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { setActiveCommunity } from '../../state/slices/propHouse';
import { slugToName } from '../../utils/communitySlugs';
import { Col, Container, Row } from 'react-bootstrap';
import RoundCard from '../../components/RoundCard';
import DelegateCard from '../../components/DelegateCard';
import HouseUtilityBar from '../../components/HouseUtilityBar';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorMessageCard from '../../components/ErrorMessageCard';
import NoSearchResults from '../../components/NoSearchResults';
import NotFound from '../../components/NotFound';
import { sortRoundByStatus } from '../../utils/sortRoundByStatus';
import { RoundStatus } from '../../components/StatusFilters';
import OpenGraphElements from '../../components/OpenGraphElements';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import ReactMarkdown from 'react-markdown';
import { markdownComponentToPlainText } from '../../utils/markdownToPlainText';
import { useTranslation } from 'react-i18next';
import { useWalletClient } from 'wagmi';
import { isMobile } from 'web3modal';

const House = () => {
  const location = useLocation();
  // const slug = location.pathname.substring(1, location.pathname.length);
  const slug = 'frontinus';

  // const { data: signer } = useSigner();
  const { data: walletClient } = useWalletClient()
  const dispatch = useAppDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));

  const [rounds, setRounds] = useState<StoredAuctionBase[]>([]);
  const [roundsOnDisplay, setRoundsOnDisplay] = useState<StoredAuctionBase[]>([]);
  const [currentRoundStatus, setCurrentRoundStatus] = useState<number>(RoundStatus.AllRounds);
  const [input, setInput] = useState<string>('');
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [failedLoadingCommunity, setFailedLoadingCommunity] = useState(false);
  const [loadingRounds, setLoadingRounds] = useState(false);
  const [failedLoadingRounds, setFailedLoadingRounds] = useState(false);
  const { t } = useTranslation();

  const [delegates, setDelegates] = useState<StoredAuctionBase[]>([]);
  const [delegatesOnDisplay, setDelegatesOnDisplay] = useState<StoredAuctionBase[]>([]);
  const [loadingDelegates, setLoadingDelegates] = useState(false);
  const [failedLoadingDelegates, setFailedLoadingDelegates] = useState(false);

  const [numberOfRoundsPerStatus, setNumberOfRoundsPerStatus] = useState<number[]>([]);

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const community = await client.current.getCommunityWithId(1);
        dispatch(setActiveCommunity(community));
        setLoadingCommunity(false);
      } catch (e) {
        setLoadingCommunity(false);
        setFailedLoadingCommunity(true);
      }
    };
    fetchCommunity();
  }, [slug, dispatch]);

  // fetch rounds
  useEffect(() => {
    if (!community) return;
    const fetchRounds = async () => {
      try {
        setLoadingRounds(true);
        const rounds = await client.current.getAuctionsForCommunity(community.id);

        setRounds(rounds);



        setLoadingRounds(false);
      } catch (e) {
        setLoadingRounds(false);
        setFailedLoadingRounds(true);
      }
    };
    fetchRounds();
  }, [community]);

  useEffect(() => {
    if (!community) return;


  }, [community]);


  // fetch filter
  useEffect(() => {
    if (!community) return;
    // Number of rounds under a certain status type in a House
    setNumberOfRoundsPerStatus([
      // number of active rounds (proposing & voting)
      rounds.filter(
          r =>
              auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
              auctionStatus(r) === AuctionStatus.AuctionVoting,
      ).length,
      rounds.length,
      delegates.length
    ]);

    // if there are no active rounds, default filter by all rounds
    rounds.filter(
        r =>
            auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
            auctionStatus(r) === AuctionStatus.AuctionVoting,
    ).length === 0 && setCurrentRoundStatus(RoundStatus.AllRounds);

  }, [rounds, delegates]);

  // fetch delegate
  useEffect(() => {
    if (!community) return;

    const fetchDelegate = async () => {
      try {
        setLoadingDelegates(true);
        const delegates = await client.current.getDelegateForCommunity();

        setDelegates(delegates);
        setDelegatesOnDisplay(delegates);



        // // Number of rounds under a certain status type in a House
        // setNumberOfRoundsPerStatus([
        //   // number of active rounds (proposing & voting)
        //   rounds.filter(
        //       r =>
        //           auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
        //           auctionStatus(r) === AuctionStatus.AuctionVoting,
        //   ).length,
        //   rounds.length,
        // ]);
        //
        // // if there are no active rounds, default filter by all rounds
        // rounds.filter(
        //     r =>
        //         auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
        //         auctionStatus(r) === AuctionStatus.AuctionVoting,
        // ).length === 0 && setCurrentRoundStatus(RoundStatus.AllRounds);

        setLoadingDelegates(false);
      } catch (e) {
        setLoadingDelegates(false);
        setFailedLoadingDelegates(true);
      }
    };
    fetchDelegate();

  }, [community ]);

  useEffect(() => {
    rounds &&
      // check if searching via input
      (input.length === 0
        ? // if a filter has been clicked that isn't "All rounds" (default)
          currentRoundStatus !== RoundStatus.Active
          ? // filter by all rounds
            setRoundsOnDisplay(rounds)
          : // filter by active rounds (proposing & voting)
            setRoundsOnDisplay(
              rounds.filter(
                r =>
                  auctionStatus(r) === AuctionStatus.AuctionAcceptingProps ||
                  auctionStatus(r) === AuctionStatus.AuctionVoting,
              ),
            )
        : // filter by search input that matches round title or description
          setRoundsOnDisplay(
            rounds.filter(round => {
              const query = input.toLowerCase();
              return (
                round.title.toLowerCase().indexOf(query) >= 0 ||
                round.description?.toLowerCase().indexOf(query) >= 0
              );
            }),
          ));


  }, [input, currentRoundStatus, rounds]);

  return (
    <>
      {community && (
        <OpenGraphElements
          title={`${community.name} Prop House`}
          description={markdownComponentToPlainText(
            <ReactMarkdown children={community.description.toString()} />,
          )}
          imageUrl={cardServiceUrl(CardType.house, community.id).href}
        />
      )}

      {loadingCommunity ? (
        <LoadingIndicator height={isMobile() ? 288 : 349} />
      ) : !loadingCommunity && failedLoadingCommunity ? (
        <NotFound />
      ) : (
        community && (
          <>
            <Container>
              <HouseHeader community={community} />
            </Container>

            <div className={classes.stickyContainer}>
              <Container>
                <HouseUtilityBar
                  numberOfRoundsPerStatus={numberOfRoundsPerStatus}
                  currentRoundStatus={currentRoundStatus}
                  setCurrentRoundStatus={setCurrentRoundStatus}
                  input={input}
                  setInput={setInput}
                />
              </Container>
            </div>

            <div className={classes.houseContainer}>
              {(currentRoundStatus != RoundStatus.delegateSelection) &&  <Container>

                <Row>
                  {loadingRounds ? (
                    <LoadingIndicator />
                  ) : !loadingRounds && failedLoadingRounds ? (
                    <ErrorMessageCard message={t('noRoundsAvailable')} />
                  ) : roundsOnDisplay.length > 0 ? (
                    sortRoundByStatus(roundsOnDisplay).map((round, index) => (
                      <Col key={index} xl={6}>
                        <RoundCard round={round} />
                      </Col>
                    ))
                  ) : input === '' ? (
                    <Col>
                      <ErrorMessageCard message={t('noRoundsAvailable')} />
                    </Col>
                  ) : (
                    <NoSearchResults />
                  )}
                </Row>
              </Container>}

              {(currentRoundStatus == RoundStatus.delegateSelection) &&  <Container>

                <Row>
                  {loadingDelegates ? (
                      <LoadingIndicator />
                  ) : !loadingDelegates && failedLoadingDelegates ? (
                      <ErrorMessageCard message={t('noDelegateAvailable')} />
                  ) : delegatesOnDisplay.length > 0 ? (
                      delegatesOnDisplay.map((round, index) => (
                          <Row key={index}>
                            <DelegateCard round={round} />
                          </Row>
                      ))
                  ) : input === '' ? (
                      <Col>
                        <ErrorMessageCard message={t('noDelegateAvailable')} />
                      </Col>
                  ) : (
                      <NoSearchResults />
                  )}
                </Row>
              </Container>}

            </div>
          </>
        )
      )}
    </>
  );
};

export default House;
