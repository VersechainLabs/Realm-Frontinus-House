import classes from './VotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import React, { useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import { StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import TruncateThousands from '../TruncateThousands';

const VotesDisplay: React.FC<{ proposal: StoredProposalWithVotes }> = props => {
  const { proposal } = props;

  const [displayVotesVerifModal, setDisplayVotesVerifModal] = useState<boolean>(false);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (proposal.votes.length > 0) setDisplayVotesVerifModal(prev => !prev);
    return;
  };
  return (
    <>
      {displayVotesVerifModal && (
        <VotesVerificationModal
          setDisplayVotesVerifModal={setDisplayVotesVerifModal}
          proposal={proposal}
        />
      )}
      <div>

        <div className={classes.scoreAndIcon}>
          <MdHowToVote />
          <TruncateThousands amount={proposal.voteCount} />
          &nbsp;· {proposal.commentCount} { proposal.commentCount > 1 && <span>Comments</span> }{ proposal.commentCount < 2 && <span>Comment</span> }
        </div>
      </div>
    </>
  );
};

export default VotesDisplay;
