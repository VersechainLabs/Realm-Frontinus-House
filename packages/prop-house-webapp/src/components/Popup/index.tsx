import React from 'react';
import './Popup.css';

interface PopupProps {
  trigger: boolean;
  children: React.ReactNode;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = (props: PopupProps) => {
  const { trigger, children, onClose } = props;

  return trigger ? (
    <div className="popup">
      <div className="popup-inner">
        <div className="text">
          {children}Thank you for creating a round!
          <br />
          It will be posted as soon as the Admin approves it.
        </div>

        <div className="button-group">
          <button className="close-btn" onClick={onClose}>
            X
          </button>
          <button className="ok-btn" onClick={onClose}>
            OK
          </button>
        </div>
      </div>
    </div>
  ) : null;
};

export default Popup;
