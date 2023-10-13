import classes from './NomineesVotesDisplay.module.css';
import { MdHowToVote } from 'react-icons/md';
import React, { useState } from 'react';
import VotesVerificationModal from '../VotesVerificationModal';
import { StoredProposalWithVotes } from '@nouns/frontinus-house-wrapper/dist/builders';
import TruncateThousands from '../TruncateThousands';

const NomineesVotesDisplay: React.FC<{ proposal: StoredProposalWithVotes }> = props => {
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.48667 10.4164C7.79 10.7284 8.28 10.7284 8.58333 10.4164L13.53 5.32872C13.6021 5.25471 13.6593 5.16681 13.6983 5.07003C13.7374 4.97326 13.7575 4.86952 13.7575 4.76475C13.7575 4.65999 13.7374 4.55625 13.6983 4.45948C13.6593 4.3627 13.6021 4.2748 13.53 4.20079L9.68 0.241058C9.60983 0.165544 9.52562 0.105297 9.43238 0.0638915C9.33914 0.0224861 9.23876 0.000765993 9.1372 1.98976e-05C9.03564 -0.000726198 8.93497 0.0195169 8.84117 0.0595482C8.74736 0.0995795 8.66232 0.158583 8.59111 0.233058L3.63667 5.32872C3.56456 5.40272 3.50736 5.49063 3.46833 5.5874C3.4293 5.68417 3.40921 5.78791 3.40921 5.89268C3.40921 5.99745 3.4293 6.10118 3.46833 6.19796C3.50736 6.29473 3.56456 6.38263 3.63667 6.45664L7.48667 10.4164ZM9.13556 1.92894L11.8889 4.76075L8.03889 8.72049L5.28556 5.88868L9.13556 1.92894ZM14.5411 10.7284L12.8922 9.03247C12.7522 8.88848 12.55 8.80048 12.3478 8.80048H12.1378L10.5822 10.4004H12.0678L13.4444 12.0003H2.55556L3.94 10.4004H5.53444L3.97889 8.80048H3.65222C3.44222 8.80048 3.24778 8.88848 3.1 9.03247L1.45111 10.7284C1.16333 11.0323 1 11.4403 1 11.8643V14.4001C1 15.28 1.7 16 2.55556 16H13.4444C13.6487 16 13.851 15.9586 14.0397 15.8782C14.2285 15.7978 14.3999 15.68 14.5444 15.5314C14.6888 15.3828 14.8034 15.2065 14.8816 15.0124C14.9598 14.8183 15 14.6102 15 14.4001V11.8643C15 11.4403 14.8367 11.0323 14.5411 10.7284Z" fill="#676B6D"/>
          </svg>
          <TruncateThousands amount={proposal.sumWeight} />
          &nbsp;·
          <svg
              width="16" height="16"
              fill={'#676B6D'}
               viewBox="0 0 16 16">

            <g>
	<path fill={'#676B6D'} className="st0" d="M8,2.4c0.5,0,1,0.1,1.4,0.4s0.7,0.7,0.9,1.1c0.2,0.4,0.2,0.9,0.1,1.4c-0.1,0.5-0.3,0.9-0.7,1.3
		C9.4,6.9,9,7.2,8.5,7.3c-0.5,0.1-1,0-1.4-0.1C6.6,6.9,6.2,6.6,6,6.2C5.7,5.8,5.6,5.3,5.6,4.8c0-0.6,0.3-1.3,0.7-1.7
		C6.7,2.7,7.4,2.4,8,2.4z M8,1C7.2,1,6.5,1.2,5.9,1.6c-0.6,0.4-1.1,1-1.4,1.7C4.2,4.1,4.1,4.9,4.2,5.6c0.1,0.7,0.5,1.4,1.1,2
		c0.5,0.5,1.2,0.9,2,1.1C8,8.8,8.8,8.7,9.5,8.4c0.7-0.3,1.3-0.8,1.7-1.4c0.4-0.6,0.6-1.4,0.6-2.1c0-0.5-0.1-1-0.3-1.5
		c-0.2-0.5-0.5-0.9-0.8-1.2c-0.4-0.4-0.8-0.6-1.2-0.8S8.5,1,8,1z"/>
              <path className="st0" d="M3.1,15H1.7c-0.2,0-0.4-0.1-0.5-0.2C1.1,14.7,1,14.5,1,14.3v-1.4c0-0.2,0.1-0.4,0.2-0.5
		c0.1-0.1,0.3-0.2,0.5-0.2h1.4c0.2,0,0.4,0.1,0.5,0.2c0.1,0.1,0.2,0.3,0.2,0.5v1.4c0,0.2-0.1,0.4-0.2,0.5C3.5,14.9,3.3,15,3.1,15z"
              />
              <path className="st0" d="M14.3,15h-1.4c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5v-1.4c0-0.2,0.1-0.4,0.2-0.5s0.3-0.2,0.5-0.2
		h1.4c0.2,0,0.4,0.1,0.5,0.2c0.1,0.1,0.2,0.3,0.2,0.5v1.4c0,0.2-0.1,0.4-0.2,0.5C14.7,14.9,14.5,15,14.3,15z"/>
              <path className="st0" d="M8.7,14.3H7.3c-0.2,0-0.4-0.1-0.5-0.2c-0.1-0.1-0.2-0.3-0.2-0.5v-1.4c0-0.2,0.1-0.4,0.2-0.5
		c0.1-0.1,0.3-0.2,0.5-0.2h1.4c0.2,0,0.4,0.1,0.5,0.2c0.1,0.1,0.2,0.3,0.2,0.5v1.4c0,0.2-0.1,0.4-0.2,0.5S8.9,14.3,8.7,14.3z"/>
              <path className="st0" d="M8,9.3c1.3,0,2.5,0.5,3.4,1.3c0.9,0.9,1.5,2,1.6,3.3h1.4c-0.1-1.6-0.8-3.2-2-4.3C11.2,8.6,9.6,7.9,8,7.9
		c-1.6,0-3.2,0.6-4.4,1.7c-1.2,1.1-1.9,2.7-2,4.3H3c0.1-1.3,0.7-2.4,1.6-3.3C5.5,9.8,6.7,9.3,8,9.3z"/>
              <path className="st0" d="M7.3,8h1.4v4.2H7.3V8z"/>
</g>
</svg>
          <TruncateThousands amount={proposal.delegatorCount} />
          &nbsp;· {proposal.commentCount} { proposal.commentCount > 1 && <span>Comments</span> }{ proposal.commentCount < 2 && <span>Comment</span> }
        </div>
      </div>

      {/*<div>*/}
      {/*  <div className={classes.scoreAndIcon}>*/}
      {/*     <TruncateThousands amount={proposal.commentCount} />*/}
      {/*  </div>*/}
      {/*</div>*/}
    </>
  );
};

export default NomineesVotesDisplay;
