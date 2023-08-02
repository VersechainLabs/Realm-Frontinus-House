import React from 'react';
import classes from './VoteListPopup.module.css';
import {StoredVote} from "@nouns/frontinus-house-wrapper/dist/builders";
import AddressAvatar from "../AddressAvatar";

interface PopupProps {
  trigger: boolean;
  voteCount: number | undefined;
  voteList: StoredVote[] | undefined;
  onClose: () => void;
}

const VoteListPopup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, onClose,voteList,voteCount } = props;

  return (
    <div className={classes.popup} >
      <div className={classes.popupinner}>
        <div className={classes.listTitle}>Votes ({voteCount})</div>
        <div className={classes.voteList}>
          {voteList && voteList.map(item => (
              <div key={item.id}>
                <div className={classes.voteContent}>
                  <div className={classes.voteListChild}>
                    <AddressAvatar address={item.address} size={20} />
                    <div className={classes.voteUserAddress}>{item.address} </div>
                    {/*<div>X3 vote</div>*/}

                  </div>
                  <div className={classes.voteTotal}>
                    {item.actualWeight} BIBLIO
                    {/*123 BIBLIO*/}
                  </div>
                </div>

                {item.delegateList && item.delegateList.map(child => (
                    <div key={child.id} className={classes.voteContent2}>
                      <div className={classes.voteListChild}>
                        <AddressAvatar address={child.address} size={20} />
                        <div className={classes.voteUserAddress}>{child.address} </div>
                        {/*<div>X3 vote</div>*/}
                      </div>
                      <div className={classes.voteTotal}>
                        {child.actualWeight} BIBLIO
                        {/*123 BIBLIO*/}
                      </div>
                    </div>
                ))}
              </div>
          ))}
        </div>

        <div className={classes.buttongroup}>
          <button className={classes.closebtn} onClick={onClose}>
            X
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoteListPopup;
