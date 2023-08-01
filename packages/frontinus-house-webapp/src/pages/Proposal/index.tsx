import classes from './Proposal.module.css';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import NotFound from '../../components/NotFound';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useDispatch } from 'react-redux';
import { setActiveCommunity, setActiveProposal, setActiveRound } from '../../state/slices/propHouse';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../components/LoadingIndicator';
import { StoredProposalWithVotes, Vote } from '@nouns/frontinus-house-wrapper/dist/builders';
import { Container } from 'react-bootstrap';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import { useAccount, useSigner } from 'wagmi';
import Comments from '../../components/Comments';
import Button, { ButtonColor } from '../../components/Button';
import AddressAvatar from '../../components/AddressAvatar';

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const { data: signer } = useSigner();
  const { address: account } = useAccount();
  const navigate = useNavigate();

  const [failedFetch, setFailedFetch] = useState(false);

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new ApiWrapper(backendHost, signer));
  const [loading,setLoading] = useState(true);


  const handleBackClick = () => {
    if (!community || !round) return;
    navigate(buildRoundPath(community, round)+`/${round.id}`, { replace: false });
  };

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, signer);
  }, [signer, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id),
          account,
        )) as StoredProposalWithVotes;
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
  }, [id, dispatch, failedFetch, account]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getAuction(proposal.auctionId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

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
                  <IoArrowBackCircleOutline size={'1.5rem'} /> View round
                </div>
              }
            />
          </Container>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}

        {/*{proposal && !loading ? (*/}
        {/*  <div>*/}
        {/*    <div style={{ height: 30 }}></div>*/}
        {/*    /!*<h2>Comments</h2>*!/*/}
        {/*    <Comments proposalId={Number(id)} />*/}
        {/*  </div>*/}
        {/*):*/}
        {/*    (*/}
        {/*        <LoadingIndicator />*/}

        {/*  )}*/}
        {proposal && (
          <div style={{ marginTop: '30px', marginBottom: '30px' ,display:'flex'}}>
            <Button text={'　　Vote　　'} bgColor={ButtonColor.Purple}
                    disabled={!proposal.canVote}
                    onClick={async () => {
                      // TODO: 按钮需要加 loading
                      try {
                        const voteResult = await backendClient.current.createVote({ proposalId: proposal.id } as Vote);
                        console.log('voteResult: ', voteResult);
                      } catch (e) {
                        //
                      } finally {
                        // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。
                      }
                    }} />
            {!proposal.canVote && (
              <p style={{marginLeft: '10px'}}>{proposal.disallowedVoteReason}</p>
            )}
          </div>
        )}


        <div className={classes.voteMain}>
          <div className={classes.voteHeader}>
            <div className={classes.voteHeaderText}>
              Votes
            </div>
            <div className={classes.voteHeaderNum}>
              {proposal.voteCount}
            </div>
          </div>
          <div className={classes.voteList}>
            {proposal && proposal.votes.map(item => (
                <div className={classes.voteContent}>
                  <div className={classes.voteListChild}>
                    <AddressAvatar address={item.address} size={20} />
                    <div className={classes.voteUserAddress}>{item.address} </div>
                    {/*<div>X3 vote</div>*/}
                  </div>
                  <div className={classes.voteTotal}>
                    {item.actualWeight} BIBLIO
                    {/*123 BIBLIO*/}
                  </div>
                </div>
            ))}



          </div>

        </div>


        {proposal && (
                <div>
                  <div style={{ height: 30 }}></div>
                  {/*<h2>Comments</h2>*/}
                  <Comments proposalId={Number(id)} />
                </div>
            )}

      </Container>
    </>
  );
};

export default Proposal;
