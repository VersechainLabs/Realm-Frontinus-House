import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import { useState } from 'react';
import React from 'react';
import classes from './CongratsDialog.module.css';
import IconButton from '@mui/material/IconButton';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks';

interface CongratsDialogProps {
  trigger: boolean;
  onClose: () => void;
}

const CongratsDialog: React.FC<CongratsDialogProps> = (props: CongratsDialogProps) => {
  const location = useLocation();
  const activeAuction = useAppSelector(state => state.propHouse.activeRound);

  return (
    <>
      {props.trigger && (
        <div className={classes.dialogBody}>
          <div className={classes.dialogInner}>
            <Dialog
              open={props.trigger}
              onClose={props.onClose}
              aria-labelledby={classes.dialogTitle}
              aria-describedby={classes.dialogDesc}
              PaperProps={{
                sx: {
                  backgroundColor: 'transparent',
                  borderRadius: '8px',
                  boxShadow: 'none',
                },
              }}
            >
              <div className={classes.dialogText}>
                <IconButton
                  className={classes.closeBtn}
                  sx={{
                    position: 'absolute',
                    left: '548px',
                    top: '20px',
                    border: '1px solid #2c2c2d',
                    borderRadius: '8px',
                  }}
                >
                  <img
                    src="/x-icon.png"
                    alt="Close"
                    onClick={props.onClose}
                    style={{
                      width: '14px',
                      height: '14px',
                    }}
                  />
                </IconButton>
                <DialogTitle
                  sx={{
                    position: 'absolute',
                    fontSize: '24px',
                    left: 225,
                    top: 30,
                  }}
                  className={classes.dialogTitle}
                >
                  <div
                    className={classes.congratsImg}
                    style={{ marginLeft: '25px', marginTop: '-10px' }}
                  >
                    <img width="64" height="64" src="/congrats.png" alt="Congrats" />
                  </div>
                  <div
                    className={'frontinusTitle'}
                    style={{ marginBottom: '5px', fontWeight: '700' }}
                  >
                    Congrats!
                  </div>
                </DialogTitle>
                <DialogContent
                  className={classes.dialogDesc}
                  sx={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  Your proposal has been successfully submitted to{' '}
                  <span style={{ color: '#F5EEE6' }}>{activeAuction?.title}</span>
                </DialogContent>
                <DialogActions>
                  <div className={classes.buttonGroup}>
                    <Button
                      sx={{
                        width: '96px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#D0A059',
                        color: '#111111',
                        position: 'absolute',
                        left: 250,
                        bottom: 40,
                        fontSize: '16px',
                        fontFamily: 'Inconsolata',
                      }}
                      className={classes.okBtn}
                      onClick={props.onClose}
                    >
                      OK
                    </Button>
                  </div>
                </DialogActions>
              </div>
              {/* <DialogActions>
                <Button className={classes.okBtn} onClick={props.onClose}>
                  OK
                </Button>
              </DialogActions> */}
            </Dialog>
          </div>
        </div>
      )}
    </>
  );
};

export default CongratsDialog;
