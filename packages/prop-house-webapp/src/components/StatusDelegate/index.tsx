import clsx from 'clsx';
import classes from './StatusDelegate.module.css';
import {DelegateVoteStatus } from '../../utils/auctionStatus';


const StatusDelegate: React.FC<{ status: DelegateVoteStatus }> = props => {
    const { status } = props;

    let copy = '';
    let bgClass = '';

    switch (status) {
        case DelegateVoteStatus.DelegateNotStarted:
            copy = 'Not Started';
            bgClass = classes.grayBg;
            break;
        case DelegateVoteStatus.DelegateAccepting:
            copy = 'Accepting Applicant';
            bgClass = classes.greenBg;
            break;
        case DelegateVoteStatus.DelegateDelegating:
            copy = 'Delegating';
            bgClass = classes.purpleBg;
            break;
        case DelegateVoteStatus.DelegateGranted:
            copy = 'Delegation Granted';
            bgClass = classes.greenBg;
            break;
        case DelegateVoteStatus.DelegateEnd:
            copy = 'Delegation Ended';
            bgClass = classes.grayBg;
            break;
    }

    return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusDelegate;
