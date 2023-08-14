import React from 'react';
import './Popup.css';

interface PopupProps {
  trigger: boolean;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, onClose } = props;

  return (
    <div className="popup">
      <div className="popup-inner">
        <div className="text">
          Thank you for creating a round!
          <br />
          It will be posted as soon as the Admin approves it.
        </div>

        <div className="button-group">
          <button className="close-btn" onClick={onClose}>
            <img src="/x-icon.png" alt="Close" />
          </button>
          <button className="ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
