import classes from './AcceptingPropsModule.module.css';
import { Community, StoredAuctionBase } from '@nouns/frontinus-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount, useWalletClient } from 'wagmi';
import { useAppSelector } from '../../hooks';
import TruncateThousands from '../TruncateThousands';
import { countDecimals } from '../../utils/countDecimals';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { ProposalCreateStatusMap } from '@nouns/frontinus-house-wrapper/dist/enums/error-codes';
import { setProposalData } from '../../state/slices/proposal';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const { data: walletClient } = useWalletClient();
  const [proposalSubmitted, setProposalSubmitted] = useState(false);
  const backendHost = useAppSelector(state => state.configuration.backendHost);

  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();
  const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
  const [proposalStatus, setProposalStatus] = useState(ProposalCreateStatusMap.OK);

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);

  useEffect(() => {
    // auction.id
    setProposalStatus(false);
    if (account && auction) {
      fetchProposalStatus();
    }
  }, [account, auction]);

  const fetchProposalStatus = async () => {
    const raw = await backendClient.current.getProposalApplied(auction.id);


    setProposalStatus(raw);
  };

  const content = (
    <>
      <b>{t('howProposingWorks')}:</b>
      <div className={classes.bulletList}>
        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <div className={classes.customParagraph}>
            <li>Anyone can submit a proposal to get funded.</li>
            <li>Owners of the Realms NFT will vote on the best proposals.</li>
            <li>
              The top {auction.numWinners} proposal will get funded{' '}
              <TruncateThousands
                amount={auction.fundingAmount}
                decimals={countDecimals(auction.fundingAmount) === 3 ? 3 : 2}
              />{' '}
              {auction.currencyType} each
            </li>
          </div>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p></p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>{isInfAuction(auction) ? 'Proposals that meet quorum will get funded.' : <></>}</p>
        </div>
      </div>

      {isProposingWindow &&
        (account ? (
          proposalStatus && !proposalStatus.canCreate ? (
            <Button text={proposalStatus.message} bgColor={ButtonColor.Gray} />
          ) : (
            <Button
              classNames={classes.margintop28}
              text={'Create your proposal'}
              bgColor={ButtonColor.Green}
              onClick={() => {
                dispatch(clearProposal());
                dispatch(setProposalData({ title: '', tldr: '', description: '', id: 0, proposalId: 0}));
                navigate('/create', { state: { auction, community, proposals } });
              }}
            />
          )
        ) : (
          <ConnectButton classNames={classes.margintop28} color={ButtonColor.Pink} />
        ))}
    </>
  );

  return (
    <RoundModuleCard
      title={t('acceptingProposals')}
      subtitle={
        <>
          Until{' '}
          {isInfAuction(auction)
            ? 'funding is depleted'
            : dayjs(auction.proposalEndTime).format('MMMM D')}
        </>
      }
      content={content}
      type="proposing"
    />
  );
};

export default AcceptingPropsModule;
