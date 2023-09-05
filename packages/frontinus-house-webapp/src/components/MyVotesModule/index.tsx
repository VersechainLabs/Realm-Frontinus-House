import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { isTimedAuction } from '../../utils/auctionType';
import RoundModuleCard from '../RoundModuleCard';
import classes from './MyVotesModule.module.css';
import VotesCard from "../VotesCard";
import {RoundOverModuleProps} from "../RoundOverModule";
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import {Col} from "react-bootstrap";
import ProposalCard from "../ProposalCard";
import {auctionStatus} from "../../utils/auctionStatus";
import {cardStatus} from "../../utils/cardStatus";
import isWinner from "../../utils/isWinner";
import getWinningIds from "../../utils/getWinningIds";

export interface MyVotesModuleProps {
    myVotes: any;
}

const MyVotesModule: React.FC<MyVotesModuleProps> = (props: MyVotesModuleProps) => {
  const { myVotes } = props;
  const { t } = useTranslation();

  const content = (
      <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={classes.CardStyle1}
      >
          <div className={classes.myVoteBlock} >
              <span className={classes.title}>
                  Your total voting power
              </span>
              <span className={classes.num}>
                  {myVotes.totalVotingPower}
              </span>

          </div>

          {myVotes.list && myVotes.list.map((prop : any, index :number) => (
              <div className={classes.myVoteBlock} key={index} >
                  <span className={classes.content}>
                      <div className={classes.dotBlock}>
                         <div className={classes.dot}> </div>
                      </div>

                      <div className={classes.titleContent}> {prop.proposal.title} </div>
                  </span>
                  <span className={classes.num}>
                      {prop.vote.weight}
                  </span>
              </div>
          ))}

          <div className={classes.myVoteBlock} >
              <span className={classes.title}>
                  Votes left
              </span>
              <span className={classes.num}>
                  {myVotes.remainVotingPower}
              </span>

          </div>

      </Card>

  );

  return content;

};

export default MyVotesModule;
