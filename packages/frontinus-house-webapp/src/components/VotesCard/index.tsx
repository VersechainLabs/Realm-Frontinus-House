import classes from './VotesCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { FiAward } from 'react-icons/fi';
import { GiDeadHead } from 'react-icons/gi';
import clsx from 'clsx';

const VotesCard: React.FC<{
    title: string | ReactElement;
    subtitle?: string | ReactElement;
    content: ReactElement;
    type: 'proposing' | 'voting' | 'ended' | 'winner' | 'stale';
}> = props => {
    const { title, subtitle, content, type } = props;
    return (
        <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
        >
            <>
                <div className={classes.sideCardHeader}>
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
