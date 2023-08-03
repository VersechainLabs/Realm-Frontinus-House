import classes from './Application.module.css';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import NotFound from '../../components/NotFound';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useDispatch } from 'react-redux';
import { setActiveCommunity, setActiveProposal, setActiveRound } from '../../state/slices/delegate';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../components/LoadingIndicator';
import { StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import { Container } from 'react-bootstrap';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import Comments from '../../components/Comments';
import Button, {ButtonColor} from "../../components/Button";
import { setAlert } from '../../state/slices/alert';
import { useWalletClient } from 'wagmi';

const Application = () => {
  const params = useParams();
  const { id } = params;

  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  const [failedFetch, setFailedFetch] = useState(false);

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.delegate.activeProposal);
  const community = useAppSelector(state => state.delegate.activeCommunity);
  const round = useAppSelector(state => state.delegate.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
  const [loading,setLoading] = useState(true);

  const [canVote, setCanVote] = useState(false);

  const handleBackClick = () => {
    console.log();

    if (!proposal || !proposal.delegationId ) return;
    // navigate(buildRoundPath(community, round)+`/${round.id}`, { replace: false });
    navigate(`/delegateDetails/` + proposal.delegationId , { replace: false });
  };

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getApplication(
          Number(id),
        ));
        document.title = `${proposal.title}`;
        dispatch(setActiveProposal(proposal));
        setLoading(false);

      } catch (e) {
        setLoading(false);
        setFailedFetch(true);
      }
    };

    fetch();

    return () => {
      document.title = 'Frontinus House';
    };
  }, [id, dispatch, failedFetch]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getDelegate(proposal.delegationId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

  useEffect(() => {
    if (!proposal || !walletClient) return;
    const fetchVoteStatus = async () => {

      const status = await backendClient.current.getDelegateStatus(proposal.id);

      if(status === 'true'){
        setCanVote(true);
      } else {
        setCanVote(false);
      }

    };

    fetchVoteStatus();
  }, [id, dispatch, proposal, walletClient]);

  return (
    <>
      <Container>
        {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.tldr}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )}
        {proposal && !loading ? (
          <Container>
            <RenderedProposalFields
              proposal={proposal}
              community={community}
              round={round && round}
              backButton={
                <div className={classes.backToAuction} onClick={() => handleBackClick()}>
                  <IoArrowBackCircleOutline size={'1.5rem'} /> View delegate
                </div>
              }
            />
          </Container>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}

        {proposal && (
            <div style={{ marginTop: '30px', marginBottom: '30px' ,display:'flex'}}>
              <Button text={'　　delegate　　'} bgColor={ButtonColor.Purple}
                      disabled={!canVote}
                      onClick={async () => {
                        try {
                          const voteResult = await backendClient.current.createDelegate(proposal.id);

                          if(voteResult.hasOwnProperty('delegationId') && voteResult.delegationId > 0){
                            dispatch(setAlert({ type: 'success', message: 'success' }));
                          }

                        } catch (e) {
                          dispatch(setAlert({ type: 'error', message: e }));
                        } finally {

                        }
                      }} />
            </div>
        )}

        {proposal && (
                <div>
                  <div style={{ height: 30 }}></div>
                  {/*<h2>Comments</h2>*/}
                  <Comments applicationId={Number(id)} />
                </div>
            )}

      </Container>
    </>
  );
};

export default Application;
