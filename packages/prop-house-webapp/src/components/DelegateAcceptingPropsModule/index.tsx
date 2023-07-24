import classes from './DelegateAcceptingPropsModule.module.css';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
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
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../hooks';

const DelegateAcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.delegate.activeProposals);
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  // const content = (
  //   <>
  //     <b>{t('howBecomeDelegate')} :</b>
  //     <div className={classes.bulletList}>
  //       <div className={classes.bulletItem}>
  //         <hr className={classes.bullet} />
  //         <p>{t('delegateDesc')}.</p>
  //       </div>
  //
  //     </div>
  //
  //     {isProposingWindow &&
  //       (account ? (
  //         <Button
  //           text={t('becomeDelegate')}
  //           bgColor={ButtonColor.Green}
  //           onClick={() => {
  //             dispatch(clearProposal());
  //             navigate('/create', { state: { auction, community, proposals } });
  //           }}
  //         />
  //       ) : (
  //         <ConnectButton color={ButtonColor.Pink} />
  //       ))}
  //   </>
  // );

    const content = (
        <>
            <b>{t('howBecomeDelegate')}:</b>
            <div className={classes.bulletList}>
                <div className={classes.bulletItem}>
                    <hr className={classes.bullet} />
                    <div className={classes.customParagraph}>
                        <p>{t('delegateDesc')}.</p>
                    </div>
                </div>

            </div>

            {isProposingWindow &&
            (account ? (
                <Button
                    text={t('becomeDelegate')}
                    bgColor={ButtonColor.Green}
                    onClick={() => {
                        dispatch(clearProposal());
                        navigate('/application/create', { state: { auction, community, proposals } });
                    }}
                />
            ) : (
                <ConnectButton color={ButtonColor.Pink} />
            ))}
        </>
    );


    return (
    <RoundModuleCard
      title={t('acceptingApplications')}
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

export default DelegateAcceptingPropsModule;
