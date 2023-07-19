import classes from './DelegateUserPropCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import isWinner from '../../utils/isWinner';
import { useState } from 'react';
import { AuctionStatus } from '../../utils/auctionStatus';
import DelegatePropStats from '../DelegatePropStats';
import CardFooter from '../UserCardFooter';
import DelegateUserCardHeader from '../DelegateUserCardHeader';

const DelegateUserPropCard: React.FC<{
  userProps: StoredProposalWithVotes[];
  status: any;
  proposals: StoredProposalWithVotes[] | undefined;
  numOfWinners: number;
  winningIds: number[];
}> = props => {
  const { userProps, winningIds, proposals, status, numOfWinners } = props;
  const [cardIndex, setCardIndex] = useState(0);

  let amountOfPropsWon = 0;
  winningIds &&
    userProps.map((prop: StoredProposalWithVotes) => {
      if (isWinner(winningIds, prop.id)) amountOfPropsWon++;
      return amountOfPropsWon;
    });

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.thirty}
      classNames={clsx(classes.sidebarContainerCard, classes.userPropCard)}
    >
      <DelegateUserCardHeader
        status={status}
        amountOfPropsWon={amountOfPropsWon}
        userProps={userProps}
        cardIndex={cardIndex}
        setCardIndex={setCardIndex}
        winningIds={winningIds}
      />

      {status !== AuctionStatus.AuctionAcceptingProps && proposals && (
        <DelegatePropStats
          status={status}
          userProps={userProps}
          cardIndex={cardIndex}
          proposals={proposals}
          numOfWinners={numOfWinners}
        />
      )}

    </Card>
  );
};
export default DelegateUserPropCard;
