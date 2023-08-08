import React from 'react';
import classes from './VoteListPopup.module.css';
import {StoredVote} from "@nouns/frontinus-house-wrapper/dist/builders";
import AddressAvatar from "../AddressAvatar";
import EthAddress from "../EthAddress";
import { styled } from '@mui/material/styles';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';


const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {onClose ? (
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: '#D0A059',
                  border: '1px solid #D0A059',
                  borderRadius: '8px',
                  fontSize: '14px',
                }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L7 5.58579L12.2929 0.292893C12.6834 -0.0976311 13.3166 -0.0976311 13.7071 0.292893C14.0976 0.683417 14.0976 1.31658 13.7071 1.70711L8.41421 7L13.7071 12.2929C14.0976 12.6834 14.0976 13.3166 13.7071 13.7071C13.3166 14.0976 12.6834 14.0976 12.2929 13.7071L7 8.41421L1.70711 13.7071C1.31658 14.0976 0.683417 14.0976 0.292893 13.7071C-0.0976311 13.3166 -0.0976311 12.6834 0.292893 12.2929L5.58579 7L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z" fill="#D0A059"/>
              </svg>

            </IconButton>
        ) : null}
      </DialogTitle>
  );
}





interface PopupProps {
  trigger: boolean;
  voteCount: number | undefined;
  voteList: StoredVote[] | undefined;
  onClose: () => void;
}

const VoteListPopup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, onClose,voteList,voteCount } = props;
  return (
  <div>

    <BootstrapDialog
        onClose={onClose}

        aria-labelledby="customized-dialog-title"
        open={trigger}
    >
      <BootstrapDialogTitle className={classes.popupTitle} id="customized-dialog-title" onClose={onClose} >
        Votes ({voteCount})
      </BootstrapDialogTitle>
      <DialogContent className={classes.popup} dividers>
        <div className={classes.voteList}>
          {voteList && voteList.map(item => (
              <div key={item.id}>
                <div className={classes.voteContent}>
                  <div className={classes.voteListChild}>
                    <AddressAvatar address={item.address} size={20} />
                    {/*<div className={classes.voteUserAddress}>{item.address} </div>*/}
                    {/*<div>X3 vote</div>*/}
                    <div className={classes.voteUserAddress}></div>
                    <EthAddress address={item.address} />

                  </div>
                  <div className={classes.voteTotal}>
                    {item.weight} BIBLIO
                    {/*123 BIBLIO*/}
                  </div>
                </div>

                {item.delegateList && item.delegateList.map(child => (
                    <div key={child.id} className={classes.voteContent2}>
                      <div className={classes.voteListChild}>
                        <AddressAvatar address={child.address} size={20} />
                        {/*<div className={classes.voteUserAddress}>{child.address} </div>*/}
                        {/*<div>X3 vote</div>*/}
                        <div className={classes.voteUserAddress}></div>
                        <EthAddress address={child.address} />
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
      </DialogContent>
    </BootstrapDialog>
  </div>

  );
};

export default VoteListPopup;
