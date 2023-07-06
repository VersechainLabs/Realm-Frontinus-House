import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';

const ErrorVotingModal: React.FC<{
  setShowErrorVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowErrorVotingModal } = props;
  const { t } = useTranslation();

  return (
    <Modal
      title={t('errorModalTitle')}
      subtitle={t('errorModalMessage')}
      image={NounImage.Banana}
      setShowModal={setShowErrorVotingModal}
    />
  );
};

export default ErrorVotingModal;
