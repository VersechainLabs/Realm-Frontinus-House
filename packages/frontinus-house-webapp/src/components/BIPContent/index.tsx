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
import {getSlug, nameToSlug} from '../../utils/communitySlugs';
import { useDispatch } from 'react-redux';
import {Link, useLocation, useNavigate} from 'react-router-dom';
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
import sanitizeHtml from "sanitize-html";
import Markdown from "markdown-to-jsx";

const BIPCard: React.FC<{
    bip: StoredProposalWithVotes;
}> = props => {

    const { bip } = props;


    const location = useLocation();
    const community = useAppSelector(state => state.propHouse.activeCommunity);
    const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
    const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();
    // overrides any tag to become a <p> tag
    const changeTagToParagraph = ({ children }: changeTagProps) => <p>{children}</p>;

    // overrides any tag to become a <span> tag
    const changeTagToSpan = ({ children }: changeTagProps) => <span>{children}</span>;
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
                    navigate('/' + getSlug(location.pathname) + `/bip/${bip.id}-${nameToSlug(bip.title)}`)
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

                            <div className={classes.titleContainer}>
                                <div className={clsx('frontinusTitle',classes.propTitle)}>{bip.title}</div>
                                <div className={clsx(classes.statusBlock,bip.votingPeriod=='Voting' && classes.statusVoting,bip.votingPeriod=='Not Started' && classes.statusNotStarted)}>{bip.votingPeriod}</div>
                            </div>

                            <div className={classes.secondLine}>
                                <Markdown
                                    className={classes.truncatedTldr}
                                    options={{
                                        overrides: {
                                            h1: changeTagToParagraph,
                                            h2: changeTagToParagraph,
                                            h3: changeTagToParagraph,
                                            a: changeTagToSpan,
                                            br: changeTagToSpan,
                                        },
                                    }}
                                >
                                    {sanitizeHtml(bip.content)}
                                </Markdown>


                                    {/*<ReactMarkdown*/}
                                    {/*    className={classes.truncatedTldr}*/}
                                    {/*    children={bip.content}*/}
                                    {/*    disallowedElements={['img', '']}*/}
                                    {/*    components={{*/}
                                    {/*        h1: 'p',*/}
                                    {/*        h2: 'p',*/}
                                    {/*        h3: 'p',*/}
                                    {/*    }}*/}
                                    {/*/>*/}
                                {imgUrlFromProp && (
                                    <div className={classes.propImgContainer}>
                                        <img src={imgUrlFromProp} alt="propCardImage" />
                                    </div>
                                )}
                            </div>

                        </div>


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
