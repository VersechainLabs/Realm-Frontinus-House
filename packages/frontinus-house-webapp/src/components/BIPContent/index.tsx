import classes from './BIPContent.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import VotingControls from '../VotingControls';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import VotesDisplay from '../VotesDisplay';
import { useAppSelector } from '../../hooks';
import { nameToSlug } from '../../utils/communitySlugs';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
    InfRoundFilterType,
    setActiveProposal,
    setModalActive,
} from '../../state/slices/propHouse';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import { BiAward } from 'react-icons/bi';
import Divider from '../Divider';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { useEffect, useState } from 'react';
import { isTimedAuction } from '../../utils/auctionType';
import { isMobile } from 'web3modal';

const BIPCard: React.FC<{
    bip: StoredProposalWithVotes;
}> = props => {

    const { bip } = props;



    const community = useAppSelector(state => state.propHouse.activeCommunity);
    const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
    const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();

    useEffect(() => {
        let imgUrl;

        const getImg = async () => {
            // imgUrl = await getFirstImageFromProp(proposal);
            imgUrl = bip.previewImage;

            if ( imgUrl ){
                setImgUrlFromProp(imgUrl);
            }
            setDisplayTldr(!isMobile() || (isMobile() && !imgUrl));
        };
        getImg();
    }, [bip]);


    const navigate = useNavigate();

    return (
        <>
            <div
                onClick={e => {
                    if (!community) return;
                    navigate(`/bip/${bip.id}`)
                }}
            >
                <Card
                    bgColor={CardBgColor.White}
                    borderRadius={CardBorderRadius.thirty}
                    classNames={clsx(
                        classes.proposalCard,
                    )}
                >
                    <div className={classes.propInfo}>
                        <div className={classes.textContainter}>
                            <div>
                                <div className={classes.titleContainer}>
                                    <div className={clsx('frontinusTitle',classes.propTitle)}>{bip.title}</div>
                                </div>

                                {displayTldr && (
                                    <ReactMarkdown
                                        className={classes.truncatedTldr}
                                        children={bip.content}
                                        disallowedElements={['img', '']}
                                        components={{
                                            h1: 'p',
                                            h2: 'p',
                                            h3: 'p',
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {imgUrlFromProp && (
                            <div className={classes.propImgContainer}>
                                <img src={imgUrlFromProp} alt="propCardImage" />
                            </div>
                        )}
                    </div>

                    <Divider narrow />

                    <div className={classes.submissionInfoContainer}>
                        <div className={classes.addressAndTimestamp}>
                            <EthAddress address={bip.address} className={classes.truncate} addAvatar />

                            <span className={clsx(classes.bullet, classes.hideDate)}>
                {' • '}
              </span>

                                <div
                                    className={clsx(classes.date,  classes.hideDate)}
                                    title={detailedTime(bip.createdDate)}
                                >
                                    {diffTime(bip.createdDate)}
                                </div>

                        </div>


                        <div className={classes.timestampAndlinkContainer}>
                            <div className={clsx(classes.avatarAndPropNumber)}>
                                <div className={classes.voteCountCopy} title={detailedTime(bip.createdDate)}>
                                    <VotesDisplay proposal={bip} />
                                </div>
                            </div>
                        </div>

                    </div>
                </Card>
            </div>
        </>
    );
};

export default BIPCard;
