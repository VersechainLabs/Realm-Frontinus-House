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
import './CongratsDialog.module.css';

export const CongratsDialog = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}> Congrats </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-desc"
      >
        <DialogTitle id="dialog-title">Congrats!</DialogTitle>
        <DialogContent id="dialog-desc">
          Your proposal has been successfully submitted to Reunionse a lanounish for Frontinus.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CongratsDialog;
