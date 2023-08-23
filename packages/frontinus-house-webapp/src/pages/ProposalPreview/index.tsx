import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import classes from './ProposalPreview.module.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { FormDataType, FundReqDataType } from '../../components/DelegateEditor';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ProposalFields } from '../../utils/proposalFields';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import {
  InfiniteAuctionProposal,
  Proposal,
  Vote,
} from '@nouns/frontinus-house-wrapper/dist/builders';
import { appendProposal } from '../../state/slices/propHouse';
import { clearProposal } from '../../state/slices/editor';
import CongratsDialog from '../../components/CongratsDialog';

const ProposalPreview: React.FC<{}> = () => {
  const location = useLocation();
  const proposalData = useAppSelector(state => state.proposal);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  //   const activeAuction = location.state.auction;
  console.log(location);
  const [openCongratsDialog, setOpenCongratsDialog] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const [propId, setPropId] = useState<null | number>(null);
  const dispatch = useAppDispatch();
  const { data: walletClient } = useWalletClient();
  const navigate = useNavigate();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host, walletClient));
  // const [formDataState, setFormDataState] = useState(formData);
  //   const { titlePreview, tldrPreview, descriptionPreview } = location.state;

  const handleGoBack = () => {
    window.history.back();
  };

  const submit = async () => {
    try {
      let newProp: Proposal | InfiniteAuctionProposal;

      newProp = new Proposal(
        proposalData.title,
        proposalData.description,
        proposalData.tldr,
        proposalData.id,
      );
      const proposal = await client.current.createProposal(newProp);

      setPropId(proposal.id);
      dispatch(appendProposal({ proposal }));
      dispatch(clearProposal());
      // setShowProposalSuccessModal(true);
      // navigate(buildRoundPath(activeCommunity, activeAuction)+`/${proposal.id}`, { replace: false });
      setOpenCongratsDialog(true);
      setShowCongratsDialog(true);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={classes.previewCard}>
      <div className={classes.title}>
        <div
          className={'frontinusTitle'}
          style={{
            marginBottom: '1rem',
          }}
        >
          Creating Your Proposal For
        </div>
      </div>
      <div className={classes.previewTitle}>
        <div
          className={'frontinusTitle'}
          style={{
            fontSize: '24px',
            fontWeight: '700',
          }}
          dangerouslySetInnerHTML={{ __html: proposalData.title }}
        />
      </div>
      <div className={classes.previewTldr}>
        <div
          className={'frontinusTitle'}
          style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '1rem',
            marginTop: '1.5rem',
          }}
        >
          Tldr
        </div>
        <div
          className={classes.tldrContent}
          dangerouslySetInnerHTML={{ __html: proposalData.tldr }}
        />
      </div>
      <div className={classes.previewDesc}>
        <div
          className={'frontinusTitle'}
          style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '1rem',
            marginTop: '1.5rem',
          }}
        >
          {' '}
          Description{' '}
        </div>
        <div
          className={classes.descContent}
          dangerouslySetInnerHTML={{ __html: proposalData.description }}
        />
      </div>
      <div
        className={classes.btnContainer}
        style={{
          marginTop: '3.5rem',
        }}
      >
        <button className={classes.submitBtn} onClick={() => submit()}>
          Sign and Submit
        </button>

        <button
          className={classes.goBackButton}
          onClick={handleGoBack}
          style={{
            backgroundColor: '#111111',
            border: '1px solid #111111',
            color: '#a6a9ab',
            width: '150px',
            height: '28px',
            fontWeight: '700',
          }}
        >
          Back to editor
        </button>
      </div>
      <CongratsDialog
        trigger={showCongratsDialog}
        onClose={() => {
          setShowCongratsDialog(false);
          navigate(`/proposal/${propId}`, { replace: false });
        }}
      />
    </div>
  );
};

export default ProposalPreview;
