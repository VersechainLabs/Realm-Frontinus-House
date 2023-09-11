import classes from './VotesCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { FiAward } from 'react-icons/fi';
import { GiDeadHead } from 'react-icons/gi';
import clsx from 'clsx';
import UserCardHeader from "../UserCardHeader";
import {AuctionStatus} from "../../utils/auctionStatus";
import PropNewStats from "../PropNewStats";
import CardFooter from "../UserCardFooter";
import {useEffect, useState} from "react";
import {StoredProposalWithVotes} from "@nouns/frontinus-house-wrapper/dist/builders";
import isWinner from "../../utils/isWinner";
import {isSameAddress} from "../../utils/isSameAddress";
import {useAccount} from "wagmi";

const VotesCard: React.FC<{
    title: string | ReactElement;
    subtitle?: string | ReactElement;
    content: ReactElement;
    type: 'proposing' | 'voting' | 'ended' | 'winner' | 'stale';
    showFlag: boolean;
    userProps: StoredProposalWithVotes[];
    status: AuctionStatus;
    proposals: StoredProposalWithVotes[] | undefined;
    numOfWinners: number;
    winningIds: number[];
}> = props => {
    const { title, subtitle, content, type, showFlag, userProps, winningIds, proposals, status, numOfWinners } = props;
    const [cardIndex, setCardIndex] = useState(0);

    let amountOfPropsWon = 0;

    const { address: account } = useAccount();
    useEffect(() => {
        if (!account || !userProps) return;
        if (userProps.length > 0) {
            winningIds &&
            userProps.map((prop: StoredProposalWithVotes) => {
                if (isWinner(winningIds, prop.id)) amountOfPropsWon++;
                return amountOfPropsWon;
            });
        }
    }, [account, userProps]);
    return (
        <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
        >
            <>
                <div className={clsx(showFlag ? classes.sideBorder : '',classes.sideCardHeader)}>
                    <div
                        className={clsx(
                            classes.icon,
                            type === 'proposing' || type === 'winner'
                                ? classes.greenIcon
                                : type === 'voting'
                                ? classes.purpleIcon
                                : type === 'stale'
                                    ? classes.grayIcon
                                    : classes.blackIcon,
                        )}
                    >
                        {/*{type === 'proposing' ? (*/}
                        {/*    <img src={'/lamp-icon.png'} style={{ width: '36px', height: '36px' }} />*/}
                        {/*) : type === 'winner' ? (*/}
                        {/*    <FiAward />*/}
                        {/*) : type === 'stale' ? (*/}
                        {/*    <GiDeadHead />*/}
                        {/*) : (*/}
                        {/*    <VoteIcon />*/}
                        {/*)}*/}
                        <img src={'/vote-icon1.png'} style={{ width: '36px', height: '36px' }} />

                    </div>
                    <div className={classes.textContainer}>

                        <div className={classes.title}>{title}</div>
                        <div className={classes.subtitle}>{subtitle}</div>
                    </div>

                </div>
                {showFlag && (<div>
                    <UserCardHeader
                        status={status}
                        amountOfPropsWon={amountOfPropsWon}
                        userProps={userProps}
                        cardIndex={cardIndex}
                        setCardIndex={setCardIndex}
                        winningIds={winningIds}
                    />

                    {status !== AuctionStatus.AuctionAcceptingProps && proposals && (
                        <PropNewStats
                            status={status}
                            userProps={userProps}
                            cardIndex={cardIndex}
                            proposals={proposals}
                            numOfWinners={numOfWinners}
                        />
                    )}

                    {/*<CardFooter*/}
                    {/*    status={status}*/}
                    {/*    amountOfPropsWon={amountOfPropsWon}*/}
                    {/*    winningIds={winningIds}*/}
                    {/*    userProps={userProps}*/}
                    {/*    cardIndex={cardIndex}*/}
                    {/*/>*/}
                </div>)}

            </>

            {
                type !== 'voting' &&(
                    <div className={classes.sideCardBody}>{content}</div>
                )
            }

        </Card>
    );
};
export default VotesCard;
