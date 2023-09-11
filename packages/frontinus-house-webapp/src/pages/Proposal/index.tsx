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
import {DeleteVote, StoredProposalWithVotes, Vote} from '@nouns/frontinus-house-wrapper/dist/builders';
import { Container } from 'react-bootstrap';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import { useAccount, useWalletClient } from 'wagmi';
import Comments from '../../components/Comments';
import Button, { ButtonColor } from '../../components/Button';
import AddressAvatar from '../../components/AddressAvatar';
import VoteListPopup from '../../components/VoteListPopup';
import EthAddress from '../../components/EthAddress';
import { LoadingButton } from '@mui/lab';

import Slider, { SliderThumb, SliderValueLabelProps } from '@mui/material/Slider';
import { styled } from '@mui/material/styles';
import {RoundStatus} from "../../components/StatusFilters";

const PrettoSlider = styled(Slider)({
  color: '#2D2D32',
  height: 8,
  width: 200,
  '& .MuiSlider-track': {
    border: 'none',
    backgroundColor: '#D0A059',
  },
  '& .MuiSlider-thumb': {
    height: 16,
    width: 16,
    backgroundColor: '#D0A059',
    border: 'none',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: ' 0px 2px 8px 0px rgba(0, 0, 0, 0.25)',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: '#2D2D32',
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
});

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const { data: walletClient } = useWalletClient();
  const {address: account} = useAccount();
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
  const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
  const [loading,setLoading] = useState(true);
  const [canVote,setCanVote] = useState(0);
  const [showChild,setShowChild] = useState([]);
  const [votePower,setVotePower] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  // const [defaultValue,setDefaultValue] = useState(0);

  let [inputValue, setInputValue] = useState(0);

  // const handleButtonClick = () => {
  //   sliderRef.current.forceUpdate();
  // };

  // 处理 Slider 值变化
  const handleSliderChange = (event : any, newValue : number | Array<any>) => {
    setInputValue(newValue as number);
  };

  // 处理 Input 值变化
  const handleInputChange = (event : any) => {

    console.log(event.target.value)

    const newValue = event.target.value.replace(/\./g, '')

    if(parseInt(newValue) > votePower){
      setInputValue(votePower);
    } else {
      setInputValue(newValue === '' ? 0 : parseInt(newValue));
    }


  };



  const handleBackClick = () => {
    if (!community || !round) return;
    // navigate(`/${round.id}` + buildRoundPath(community, round), { replace: false });
    window.location.replace(`/${round.id}` + buildRoundPath(community, round) )
  };

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);

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
        if (proposal && proposal.voteState) {
          if (proposal.voteState.code === 200) {
            setCanVote(1);
          } else if (proposal.voteState.code === 311) {
            setCanVote(2);
          } else if (proposal.voteState.code === 314 ||
              proposal.voteState.code === 312 ||
              proposal.voteState.code === 313 ||
              proposal.voteState.code === 319
          ) {
            setCanVote(3);
          }

          setVotePower( parseInt( proposal.voteState.votingPower ));

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
      const community = await backendClient.current.getCommunityWithId(round.community.id);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
    window.scrollTo(0, 0);

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
          <div style={{ marginTop: '20px' ,display:'flex'}}>
            {canVote === 1 && (
                <div className={classes.flexCenter}>
                  <div>

                    {/*<button*/}
                    {/*    disabled={(inputValue < 1)}*/}
                    {/*    className={ (inputValue > 0) ? classes.approveButton : classes.disApproveButton }*/}
                    {/*    onClick={async () => {*/}
                    {/*      // TODO: 按钮需要加 loading*/}
                    {/*      try {*/}
                    {/*        console.log(proposal.id );*/}
                    {/*        const voteResult = await backendClient.current.createVote(new Vote(proposal.id, inputValue));*/}
                    {/*        window.location.reload();*/}
                    {/*        console.log('voteResult: ', voteResult);*/}
                    {/*      } catch (e) {*/}
                    {/*        console.log(e);*/}
                    {/*        //*/}
                    {/*      } finally {*/}
                    {/*        // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。*/}
                    {/*      }*/}
                    {/*    }}*/}
                    {/*>*/}
                    {/*  Approve*/}

                    {/*</button>*/}
                    <div className={(inputValue > 0) ? classes.approveButton : classes.disApproveButton}>
                      <LoadingButton
                          loading={isButtonDisabled} // Pass the loading state here
                          type="submit" // Make sure to set the type attribute to "submit"
                          variant="outlined"
                          disabled={isButtonDisabled} // Disable the button while loading
                          onClick={async () => {
                            // TODO: 按钮需要加 loading
                            try {
                              setIsButtonDisabled(true);
                              console.log(proposal.id );
                              const voteResult = await backendClient.current.createVote(new Vote(proposal.id, inputValue));
                              window.location.reload();
                              console.log('voteResult: ', voteResult);
                            } catch (e) {
                              console.log(e);
                              //
                            } finally {
                              setIsButtonDisabled(false);
                              // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。
                            }
                          }}
                          style={{ textTransform: 'capitalize' }}
                      >
                        Approve
                      </LoadingButton>
                    </div>
                  </div>
                  <div className={  classes.approveIcon  } >
                    <svg width="13" height="14" viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.83761 9.11433C6.11059 9.38731 6.55156 9.38731 6.82454 9.11433L11.2762 4.66263C11.3411 4.59787 11.3926 4.52095 11.4277 4.43628C11.4629 4.3516 11.4809 4.26083 11.4809 4.16916C11.4809 4.07749 11.4629 3.98672 11.4277 3.90204C11.3926 3.81737 11.3411 3.74045 11.2762 3.67569L7.81147 0.210925C7.74832 0.144851 7.67255 0.0921348 7.58863 0.0559051C7.50472 0.0196753 7.41439 0.000670244 7.32299 1.74104e-05C7.23159 -0.000635423 7.141 0.0170773 7.05657 0.0521047C6.97215 0.087132 6.89563 0.13876 6.83154 0.203926L2.37284 4.66263C2.30795 4.72738 2.25647 4.8043 2.22135 4.88897C2.18622 4.97365 2.16814 5.06442 2.16814 5.15609C2.16814 5.24777 2.18622 5.33854 2.22135 5.42321C2.25647 5.50789 2.30795 5.58481 2.37284 5.64956L5.83761 9.11433ZM7.32151 1.68783L9.79934 4.16566L6.33458 7.63043L3.85674 5.15259L7.32151 1.68783ZM12.1862 9.38731L10.7023 7.90341C10.5763 7.77742 10.3943 7.70042 10.2123 7.70042H10.0233L8.62342 9.10033H9.96033L11.1992 10.5002H1.39991L2.64582 9.10033H4.08073L2.68082 7.70042H2.38684C2.19785 7.70042 2.02286 7.77742 1.88987 7.90341L0.405973 9.38731C0.14699 9.65329 0 10.0103 0 10.3812V12.6001C0 13.37 0.629958 14 1.39991 14H11.1992C11.3831 14 11.5651 13.9638 11.735 13.8934C11.9048 13.8231 12.0591 13.72 12.1891 13.59C12.3191 13.46 12.4222 13.3057 12.4926 13.1358C12.5629 12.966 12.5992 12.7839 12.5992 12.6001V10.3812C12.5992 10.0103 12.4522 9.65329 12.1862 9.38731Z" fill="#F5EEE6"/>
                    </svg>
                  </div>

                  <div className={classes.xIcon}>
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M0.0471211 7.5L2.62312 3.772L0.0791211 0.0599995H1.98312L3.58312 2.364L5.07112 0.0599995H6.89512L4.54312 3.708L7.21512 7.5H5.26312L3.58312 5.132L1.98312 7.5H0.0471211Z" fill="#666666"/>
                    </svg>
                  </div>

                  <div>
                    <input
                        className={classes.voteWeight}
                        type="number"
                        value={inputValue}
                        onChange={e => handleInputChange(e)}
                        min={0}
                        max={votePower}
                    />
                  </div>

                  <div
                      className={classes.slider}
                      style={{marginLeft:'20px',paddingTop:'7px'}}>
                    <PrettoSlider
                        valueLabelDisplay="auto"
                        onChange={handleSliderChange}
                        value={inputValue}
                        // step={1}
                        min={0}
                        max={votePower}
                    />
                  </div>

                  <div className={classes.leftNum}>
                    Left {(votePower - inputValue)}
                  </div>

                </div>
            )}
            {canVote === 2 && (
                // <button
                //     className={classes.disApproveButton}
                //     onClick={async () => {
                //       // TODO: 按钮需要加 loading
                //       try {
                //         const voteResult = await backendClient.current.deleteVote(new DeleteVote(proposal.id));
                //         window.location.reload();
                //         console.log('voteResult: ', voteResult);
                //       } catch (e) {
                //         //
                //         console.log(e);
                //       } finally {
                //         // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。
                //       }
                //     }}
                // >
                //   Cancel Approve
                //   {/*<svg className={classes.approveSvg} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
                //   {/*  <path d="M9.41333 12.7184C9.76 13.0694 10.32 13.0694 10.6667 12.7184L16.32 6.99481C16.4024 6.91155 16.4678 6.81266 16.5124 6.70379C16.557 6.59492 16.58 6.47821 16.58 6.36035C16.58 6.24248 16.557 6.12578 16.5124 6.01691C16.4678 5.90804 16.4024 5.80915 16.32 5.72589L11.92 1.27119C11.8398 1.18624 11.7436 1.11846 11.637 1.07188C11.5304 1.0253 11.4157 1.00086 11.2997 1.00002C11.1836 0.999183 11.0685 1.02196 10.9613 1.06699C10.8541 1.11203 10.7569 1.17841 10.6756 1.26219L5.01333 6.99481C4.93093 7.07806 4.86555 7.17696 4.82095 7.28582C4.77634 7.39469 4.75338 7.5114 4.75338 7.62926C4.75338 7.74713 4.77634 7.86383 4.82095 7.9727C4.86555 8.08157 4.93093 8.18046 5.01333 8.26372L9.41333 12.7184ZM11.2978 3.17006L14.4444 6.35585L10.0444 10.8106L6.89778 7.62476L11.2978 3.17006ZM17.4756 13.0694L15.5911 11.1615C15.4311 10.9995 15.2 10.9005 14.9689 10.9005H14.7289L12.9511 12.7004H14.6489L16.2222 14.5003H3.77778L5.36 12.7004H7.18222L5.40444 10.9005H5.03111C4.79111 10.9005 4.56889 10.9995 4.4 11.1615L2.51556 13.0694C2.18667 13.4114 2 13.8703 2 14.3473V17.2001C2 18.1901 2.8 19 3.77778 19H16.2222C16.4557 19 16.6869 18.9534 16.9025 18.863C17.1182 18.7725 17.3142 18.64 17.4793 18.4728C17.6444 18.3057 17.7753 18.1073 17.8647 17.8889C17.954 17.6705 18 17.4365 18 17.2001V14.3473C18 13.8703 17.8133 13.4114 17.4756 13.0694Z" fill="#F5EEE699"/>*/}
                //   {/*</svg>*/}
                // </button>

<div className={classes.disApproveButton}>
  <LoadingButton
      loading={isButtonDisabled} // Pass the loading state here
      type="submit" // Make sure to set the type attribute to "submit"
      variant="outlined"
      disabled={isButtonDisabled} // Disable the button while loading
      onClick={async () => {
        // TODO: 按钮需要加 loading
        try {
          setIsButtonDisabled(true);

          const voteResult = await backendClient.current.deleteVote(new DeleteVote(proposal.id));
          window.location.reload();
          console.log('voteResult: ', voteResult);
        } catch (e) {
          //
          console.log(e);
        } finally {
          setIsButtonDisabled(false);
          // TODO: 按钮取消 loading，如果投票成功，设为 disable并且更新 vote list。
        }
      }}

      style={{ textTransform: 'capitalize' }}
  >
    Cancel Approve
  </LoadingButton>
</div>



            )}
            {canVote === 3 && (
                <div className={classes.noPow} >
                  {proposal && proposal.voteState && proposal.voteState.reason}
                </div>
            )}
            {canVote === 0 && (
                <button
                    disabled={true}
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


        {proposal && proposal.votes && proposal.votes.length > 0 && (<div className={classes.voteMain}>
          <div className={classes.voteHeader}>
            <div className={classes.voteHeaderText}>
              Votes
            </div>
            <div className={classes.voteHeaderNum}>
              {proposal && proposal.voteCount}
            </div>
          </div>
          <div >
            {proposal.votes.map(item => (
                <div key={item.id}>
                  <div className={classes.voteContent}>
                    <div className={classes.voteListChild}>
                      <AddressAvatar address={item.address} size={20} />
                      {/*<div className={classes.voteUserAddress}>{item.address} </div>*/}
                      <div className={classes.voteUserAddress}></div>
                      <EthAddress address={item.address} />
                      {item.delegateList && item.delegateList.length>0 && (<div className={classes.voteCount} onClick={()=> {
                        const index = showChild.indexOf(item.id);
                        if (index !== -1) {
                          const newShowChild = showChild.filter(employee => {
                            // 👇️ remove object that has id equal to 2
                            if (employee != item.id) {
                              return employee;
                            }
                          })
                          setShowChild(newShowChild);
                        } else {
                          setShowChild(current => [...current, item.id]);
                        }
                      }}>
                        x{item.delegateList.length} Delegation
                        {showChild.indexOf(item.id) !== -1 && (
                            <svg className={classes.voteSvg} width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.875 5.65292L5.5 0.711771C5.44178 0.646018 5.36629 0.59265 5.27951 0.555893C5.19272 0.519136 5.09703 0.5 5 0.5C4.90297 0.5 4.80728 0.519136 4.72049 0.555893C4.63371 0.59265 4.55822 0.646018 4.5 0.711771L0.125001 5.65292C0.0553589 5.73157 0.0129499 5.8251 0.00252628 5.92303C-0.00789833 6.02095 0.0140753 6.1194 0.0659838 6.20734C0.117891 6.29528 0.197684 6.36924 0.296419 6.42093C0.395154 6.47262 0.50893 6.5 0.625 6.5H9.375C9.49107 6.5 9.60485 6.47262 9.70358 6.42093C9.80232 6.36924 9.88211 6.29528 9.93402 6.20734C9.98592 6.1194 10.0079 6.02095 9.99747 5.92303C9.98705 5.8251 9.94464 5.73157 9.875 5.65292Z" fill="#676B6D"/>
                            </svg>
                        )}
                        {showChild.indexOf(item.id) === -1 && (
                            <svg className={classes.voteSvg} width="10" height="7" viewBox="0 0 10 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.875 1.34708L5.5 6.28823C5.44178 6.35398 5.36629 6.40735 5.27951 6.44411C5.19272 6.48086 5.09703 6.5 5 6.5C4.90297 6.5 4.80728 6.48086 4.72049 6.44411C4.63371 6.40735 4.55822 6.35398 4.5 6.28823L0.125001 1.34708C0.0553589 1.26843 0.0129499 1.1749 0.00252628 1.07697C-0.00789833 0.979049 0.0140753 0.880601 0.0659838 0.79266C0.117891 0.704719 0.197684 0.63076 0.296419 0.57907C0.395154 0.527379 0.50893 0.5 0.625 0.5H9.375C9.49107 0.5 9.60485 0.527379 9.70358 0.57907C9.80232 0.63076 9.88211 0.704719 9.93402 0.79266C9.98592 0.880601 10.0079 0.979049 9.99747 1.07697C9.98705 1.1749 9.94464 1.26843 9.875 1.34708Z" fill="#676B6D"/>
                            </svg>
                        )}
                      </div>)}

                    </div>
                    <div className={classes.voteTotal}>
                      {item.weight} BIBLIO
                      {/*123 BIBLIO*/}
                    </div>
                  </div>

                  {item.delegateList && showChild.indexOf(item.id) !== -1 && item.delegateList.map(child => (
                      <div key={child.id} className={classes.voteContent2}>
                        <div className={classes.voteListChild}>
                          <AddressAvatar address={child.address} size={20} />
                          {/*<div className={classes.voteUserAddress}>{child.address} </div>*/}
                          <div className={classes.voteUserAddress}></div>
                          <EthAddress address={child.address} />
                          {/*<div>X3 vote</div>*/}
                        </div>
                        {/*<div className={classes.voteTotal}>*/}
                        {/*  {child.actualWeight} BIBLIO*/}
                        {/*  /!*123 BIBLIO*!/*/}
                        {/*</div>*/}
                      </div>
                  ))}
                </div>
            ))}
            {proposal && (<div className={classes.seeMore} onClick={() => openPopop()}>
              See more
            </div>)}

          </div>

        </div>
        )}

        {proposal && (
                <div>
                  <div style={{ height: 30 }}></div>
                  {/*<h2>Comments</h2>*/}
                  <Comments proposalId={Number(id)} commentCount={Number(proposal.commentCount)}/>
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
