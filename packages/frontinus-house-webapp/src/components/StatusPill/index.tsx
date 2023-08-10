import clsx from 'clsx';
import classes from './StatusPill.module.css';
import { AuctionStatus } from '../../utils/auctionStatus';

const StatusPill: React.FC<{ status: AuctionStatus }> = props => {
  const { status } = props;

  let copy = '';
  let bgClass = '';

  switch (status) {
    case AuctionStatus.AuctionNotStarted:
      copy = 'Not started';
      bgClass = classes.grayBg1;
      break;
    case AuctionStatus.AuctionAcceptingProps:
      copy = 'Proposing';
      bgClass = classes.greenBg;
      break;
    case AuctionStatus.AuctionVoting:
      copy = 'Voting';
      bgClass = classes.greenBg;
      break;
    case AuctionStatus.AuctionEnded:
      copy = 'Ended';
      bgClass = classes.grayBg;
      break;
  }

  return <span className={clsx(classes.pillContainer, bgClass)}>{copy}</span>;
};

export default StatusPill;
