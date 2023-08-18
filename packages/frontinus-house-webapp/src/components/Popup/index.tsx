import React from 'react';
import classes from './Popup.module.css';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useLocation, useNavigate } from 'react-router-dom';

interface PopupProps {
  trigger: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, onClose } = props;

  return (
    <Dialog open={trigger} onClose={onClose}>
      <div className={classes.popup}>
        <div className={classes.popupInner}>
          <DialogTitle
            sx={{
              fontSize: '24px',
              lineHeight: '31.68px',
              textAlign: 'center',
              fontWeight: '700',
            }}
          >
            <div className={'frontinusTitle'} style={{ marginTop: '-20px', fontWeight: '700' }}>
              Thank you for creating a round! <br></br>It will be posted as soon as the Admin
              approves it.
            </div>
          </DialogTitle>
          <DialogActions
            className={classes.buttonGroup}
            sx={{
              marginTop: '2px',
            }}
          >
            <IconButton className={classes.closeBtn} onClick={onClose}>
              <img src="/x-icon.png" alt="Close" />
            </IconButton>
            <Button className={classes.okBtn} onClick={onClose} sx={{ fontFamily: 'Inconsolata' }}>
              OK
            </Button>
          </DialogActions>
        </div>
      </div>
    </Dialog>
  );
};

export default Popup;
