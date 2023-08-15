import React from 'react';
import classes from './Popup.module.css';

interface PopupProps {
  trigger: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, onClose } = props;

  return (
    <div className={classes.popup}>
      <div className={classes.popupInner}>
        <div className={'frontinusTitle'}>
          Thank you for creating a round!
          <br />
          It will be posted as soon as the Admin approves it.
        </div>

        <div className={classes.buttonGroup}>
          <button className={classes.closeBtn} onClick={onClose}>
            <img src="/x-icon.png" alt="Close" />
          </button>
          <button className={classes.okBtn} onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
