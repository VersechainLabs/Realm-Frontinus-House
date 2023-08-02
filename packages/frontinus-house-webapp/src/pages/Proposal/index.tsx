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
import VoteListPopup from '../../components/VoteListPopup';

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const { data: signer } = useSigner();
  const { address: account } = useAccount();
  const navigate = useNavigate();

  const [failedFetch, setFailedFetch] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const closePopup = () => {
    setShowPopup(false)
  };
  const openPopop = () => {
    setShowPopup(true)
  };

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new ApiWrapper(backendHost, signer));
  const [loading,setLoading] = useState(true);
  const [canVote,setCanVote] = useState(false);


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
        if (proposal && proposal.canVote) {
          setCanVote(true);
        }
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
            {/*<Button text={'　　Approve　　'} bgColor={ButtonColor.Purple}*/}
            {/*        disabled={!proposal.canVote}*/}
            {/*        onClick={async () => {*/}
            {/*          // TODO: 按钮需要加 loading*/}
            {/*          try {*/}
            {/*            const voteResult = await backendClient.current.createVote({ proposalId: proposal.id } as Vote);*/}
            {/*            console.log('voteResult: ', voteResult);*/}
            {/*          } catch (e) {*/}
            {/*            //*/}
            {/*          } finally {*/}
            {/*            // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。*/}
            {/*          }*/}
            {/*        }} />*/}
            {canVote && (
                <button
                    className={classes.approveButton}
                    onClick={async () => {
                      // TODO: 按钮需要加 loading
                      try {
                        const voteResult = await backendClient.current.createVote({ proposalId: proposal.id } as Vote);
                        setCanVote(false);
                        console.log('voteResult: ', voteResult);
                      } catch (e) {
                        //
                      } finally {
                        // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。
                      }
                    }}
                >
                  Approve
                  <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.41333 12.7184C9.76 13.0694 10.32 13.0694 10.6667 12.7184L16.32 6.99481C16.4024 6.91155 16.4678 6.81266 16.5124 6.70379C16.557 6.59492 16.58 6.47821 16.58 6.36035C16.58 6.24248 16.557 6.12578 16.5124 6.01691C16.4678 5.90804 16.4024 5.80915 16.32 5.72589L11.92 1.27119C11.8398 1.18624 11.7436 1.11846 11.637 1.07188C11.5304 1.0253 11.4157 1.00086 11.2997 1.00002C11.1836 0.999183 11.0685 1.02196 10.9613 1.06699C10.8541 1.11203 10.7569 1.17841 10.6756 1.26219L5.01333 6.99481C4.93093 7.07806 4.86555 7.17696 4.82095 7.28582C4.77634 7.39469 4.75338 7.5114 4.75338 7.62926C4.75338 7.74713 4.77634 7.86383 4.82095 7.9727C4.86555 8.08157 4.93093 8.18046 5.01333 8.26372L9.41333 12.7184ZM11.2978 3.17006L14.4444 6.35585L10.0444 10.8106L6.89778 7.62476L11.2978 3.17006ZM17.4756 13.0694L15.5911 11.1615C15.4311 10.9995 15.2 10.9005 14.9689 10.9005H14.7289L12.9511 12.7004H14.6489L16.2222 14.5003H3.77778L5.36 12.7004H7.18222L5.40444 10.9005H5.03111C4.79111 10.9005 4.56889 10.9995 4.4 11.1615L2.51556 13.0694C2.18667 13.4114 2 13.8703 2 14.3473V17.2001C2 18.1901 2.8 19 3.77778 19H16.2222C16.4557 19 16.6869 18.9534 16.9025 18.863C17.1182 18.7725 17.3142 18.64 17.4793 18.4728C17.6444 18.3057 17.7753 18.1073 17.8647 17.8889C17.954 17.6705 18 17.4365 18 17.2001V14.3473C18 13.8703 17.8133 13.4114 17.4756 13.0694Z" fill="#111111"/>
                  </svg>
                </button>
            )}
            {!canVote && (
                <button
                    className={classes.disApproveButton}
                >
                  Approve
                  <svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.41333 12.7184C9.76 13.0694 10.32 13.0694 10.6667 12.7184L16.32 6.99481C16.4024 6.91155 16.4678 6.81266 16.5124 6.70379C16.557 6.59492 16.58 6.47821 16.58 6.36035C16.58 6.24248 16.557 6.12578 16.5124 6.01691C16.4678 5.90804 16.4024 5.80915 16.32 5.72589L11.92 1.27119C11.8398 1.18624 11.7436 1.11846 11.637 1.07188C11.5304 1.0253 11.4157 1.00086 11.2997 1.00002C11.1836 0.999183 11.0685 1.02196 10.9613 1.06699C10.8541 1.11203 10.7569 1.17841 10.6756 1.26219L5.01333 6.99481C4.93093 7.07806 4.86555 7.17696 4.82095 7.28582C4.77634 7.39469 4.75338 7.5114 4.75338 7.62926C4.75338 7.74713 4.77634 7.86383 4.82095 7.9727C4.86555 8.08157 4.93093 8.18046 5.01333 8.26372L9.41333 12.7184ZM11.2978 3.17006L14.4444 6.35585L10.0444 10.8106L6.89778 7.62476L11.2978 3.17006ZM17.4756 13.0694L15.5911 11.1615C15.4311 10.9995 15.2 10.9005 14.9689 10.9005H14.7289L12.9511 12.7004H14.6489L16.2222 14.5003H3.77778L5.36 12.7004H7.18222L5.40444 10.9005H5.03111C4.79111 10.9005 4.56889 10.9995 4.4 11.1615L2.51556 13.0694C2.18667 13.4114 2 13.8703 2 14.3473V17.2001C2 18.1901 2.8 19 3.77778 19H16.2222C16.4557 19 16.6869 18.9534 16.9025 18.863C17.1182 18.7725 17.3142 18.64 17.4793 18.4728C17.6444 18.3057 17.7753 18.1073 17.8647 17.8889C17.954 17.6705 18 17.4365 18 17.2001V14.3473C18 13.8703 17.8133 13.4114 17.4756 13.0694Z" fill="#F5EEE699"/>
                  </svg>
                </button>
            )}
          </div>
        )}


        <div className={classes.voteMain}>
          <div className={classes.voteHeader}>
            <div className={classes.voteHeaderText}>
              Votes
            </div>
            <div className={classes.voteHeaderNum}>
              {proposal && proposal.voteCount}
            </div>
          </div>
          <div className={classes.voteList}>
            {proposal && proposal.votes.map(item => (
                <div key={item.id}>
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

                  {item.delegateList && item.delegateList.map(child => (
                      <div key={child.id} className={classes.voteContent2}>
                        <div className={classes.voteListChild}>
                          <AddressAvatar address={child.address} size={20} />
                          <div className={classes.voteUserAddress}>{child.address} </div>
                          {/*<div>X3 vote</div>*/}
                        </div>
                        <div className={classes.voteTotal}>
                          {child.actualWeight} BIBLIO
                          {/*123 BIBLIO*/}
                        </div>
                      </div>
                  ))}
                </div>
            ))}
            {proposal && (<div className={classes.seeMore} onClick={() => openPopop()}>
              See more
            </div>)}



          </div>

        </div>


        {proposal && (
                <div>
                  <div style={{ height: 30 }}></div>
                  {/*<h2>Comments</h2>*/}
                  <Comments proposalId={Number(id)} />
                </div>
            )}
        {showPopup && (
            <VoteListPopup
                voteCount={proposal && proposal.voteCount}
                trigger={true}
                onClose={closePopup}
                voteList={proposal && proposal.votes}
            />
        )}


      </Container>
    </>
  );
};

export default Proposal;
