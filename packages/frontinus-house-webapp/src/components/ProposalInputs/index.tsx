import classes from './ProposalInputs.module.css';
import './ProposalInputs.css';
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import '../../quill.css';
import clsx from 'clsx';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import validateInput from '../../utils/validateInput';
import { ProposalFields } from '../../utils/proposalFields';
import { FormDataType, FundReqDataType } from '../DelegateEditor';
import { useAccount, useWalletClient } from 'wagmi';
import InputFormGroup from '../InputFormGroup';
import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import { DeltaStatic, Quill } from 'quill';
import {
  InfiniteAuctionProposal,
  Proposal, UpdatedProposal,
  Vote,
} from '@nouns/frontinus-house-wrapper/dist/builders';
import { appendProposal } from '../../state/slices/propHouse';
import { clearProposal } from '../../state/slices/editor';
import ProposalSuccessModal from '../ProposalSuccessModal';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { setAlert } from '../../state/slices/alert';
import { matchImg } from '../../utils/matchImg';
import CongratsDialog from '../CongratsDialog';
import ProposalPreview from '../../pages/ProposalPreview';
import { setProposalData } from '../../state/slices/proposal';

const ProposalInputs: React.FC<{
  formData: FormDataType[];
  fundReqData: FundReqDataType;
  onDataChange: (data: Partial<ProposalFields>) => void;
  setProposalSubmitted: (submitted: boolean) => void;
}> = props => {
  const { formData, fundReqData, onDataChange, setProposalSubmitted } = props;

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState<number | undefined>();
  const [hasError, setHasError] = useState(false);
  const [flag, setFlag] = useState(false);

  // const validateError = async (min: number, count: number) => {
  //       let error = validateInput(min, count);
  //       if ( !hasError && !error ){
  //         setHasError(error);
  //       }
  //       return error;
  // }

  const titleAndTldrInputs = (data: any, isTitleSection: boolean = false) => (
    <InputFormGroup
      titleLabel={data.title}
      content={
        <>
          <Form.Control
            as={data.type as any}
            autoFocus={data.focus}
            maxLength={data.maxCount && data.maxCount}
            placeholder={data.placeholder}
            className={clsx(classes.input, data.fieldName === 'what' && classes.descriptionInput)}
            onChange={e => {
              setBlurred(false);
              onDataChange({ [data.fieldName]: e.target.value });
            }}
            value={data && data.fieldValue}
            onBlur={() => {
              setBlurred(true);
            }}
          />
          {blurred && validateInput(data.minCount, data.fieldValue.length) && (
            <p className={classes.inputError}>{data.error}</p>
          )}
        </>
      }
      charsLabel={
        data.maxCount ? `${data.fieldValue.length}/${data.maxCount}` : data.fieldValue.length
      }
      formGroupClasses={
        isTitleSection && fundReqData.isInfRound ? classes.infRoundTitleSection : ''
      }
    />
  );

  const navigate = useNavigate();
  const location = useLocation();
  const activeAuction = location.state.auction;
  const activeCommunity = location.state.community;
  const [showProposalSuccessModal, setShowProposalSuccessModal] = useState(false);
  const [propId, setPropId] = useState<null | number>(null);
  const [content, setContent] = useState('');
  const [imgArray, setImgArray] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [quill, setQuill] = useState<Quill | undefined>(undefined);
  const dispatch = useAppDispatch();
  const { address: account } = useAccount();
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [openCongratsDialog, setOpenCongratsDialog] = useState(false);
  const [showCongratsDialog, setShowCongratsDialog] = useState(false);
  const proposalData = useAppSelector(state => state.proposal);
  // const [proposalData, setProposalData] = useState({
  //   titlePreview: '',
  //   tldrPreview: '',
  //   descriptionPreview: '',
  // });

  const { data: walletClient } = useWalletClient();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host, walletClient));

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      setContent('');
    } else {
      setContent(htmlContent);
    }
  };
  const handleImgArrayChange = (img: string) => {
    let ary = [...imgArray];
    ary.push(img);
    setImgArray(ary);
  };

  const [getDefaultStatus, setGetDefaultStatus] = useState(false);
  const [getDefault, setGetDefault] = useState('');

  const fetchDefault = async () => {
    if (getDefaultStatus) {
      return;
    }
    setGetDefaultStatus(true);

    if (!proposalData.description && !getDefault) {
      await client.current.getDefaultCreation().then((res: any) => {
        if (res.proposalContent) {
          setGetDefault(res.proposalContent);
          // setGetDefaultStatus(false);
        }
      });
    } else {
      setGetDefault(proposalData.description);

      // dispatch(setProposalData({ title: '', tldr: '', description: '', id: 0 }));
    }
  };
  fetchDefault();

  const generatePreviewContent = () => {
    const title = formData[0].fieldValue;
    const tldr = formData[1].fieldValue;
    const description = quill!.root.innerHTML;
    const id = activeAuction.id;

    if (title.trim().length === 0 || tldr.trim().length === 0 || description.trim().length === 0) {
      const errorMessage = 'All fields must be filled before preview!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      return;
    }

    if (!account) {
      return;
    }

    //check error
    if (validateInput(formData[0].minCount, formData[0].fieldValue.length)) {
      return false;
    }

    if (validateInput(formData[1].minCount, formData[1].fieldValue.length)) {
      return false;
    }

    setLoading(true);
    dispatch(setProposalData({ title:title, tldr:tldr, description:description, id:id }));
    navigate('/preview');
  };
  const submit = async () => {
    try {
      let imgUrl = matchImg(imgArray, content);
      setLoading(true);

      if (proposalData.proposalId) {
        const proposal = await client.current.updateProposal(
            new UpdatedProposal(
                proposalData.proposalId,
                formData[0].fieldValue,
                content,
                formData[1].fieldValue,
                activeAuction.id,
                imgUrl,
                'auction',
            ),
        );
        setPropId(proposal.id);
        dispatch(appendProposal({ proposal }));
      } else {
        let newProp: Proposal | InfiniteAuctionProposal;


        newProp = new Proposal(
            formData[0].fieldValue,
            content,
            formData[1].fieldValue,
            activeAuction.id,
            'auction',
            imgUrl,
        );
        const proposal = await client.current.createProposal(newProp);
        setPropId(proposal.id);
        dispatch(appendProposal({ proposal }));
      }


      dispatch(clearProposal());

      // setShowProposalSuccessModal(true);
      // navigate(buildRoundPath(activeCommunity, activeAuction)+`/${proposal.id}`, { replace: false });
      setOpenCongratsDialog(true); // Show the initial dialog
      setShowCongratsDialog(true);
    } catch (e) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form className={classes.form}>
            <div className={clsx(fundReqData.isInfRound && classes.infRoundSectionsContainer)}>
              {/** TITLE */}
              {titleAndTldrInputs(formData[0], true)}
              {/** FUNDS REQ */}
              {fundReqData.isInfRound && (
                <InputFormGroup
                  titleLabel="Funds Request"
                  content={
                    <>
                      <Form.Control
                        type="number"
                        step="0.1"
                        className={clsx(classes.input, classes.reqAmountInput)}
                        placeholder={fundReqData.roundCurrency}
                        value={fundReq || ''}
                        onChange={e => {
                          const value = Number(e.target.value);
                          const formattedValue = value.toFixed(1);
                          setFundReq(Number(formattedValue));
                          onDataChange({ reqAmount: Number(formattedValue) });
                        }}
                        isInvalid={fundReq ? fundReq > fundReqData.remainingBal : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {fundReqData.error}
                      </Form.Control.Feedback>
                    </>
                  }
                  formGroupClasses={classes.fundReqFormGroup}
                />
              )}
            </div>

            {/** TLDR */}
            {titleAndTldrInputs(formData[1])}

            {/** DESCRIPTION */}
          </Form>
          <div className={'propEditor'}>
            <div className={classes.description}>Description</div>
            <div style={{ marginTop: '45px' }}>
              <QuillEditor
                widgetKey={'Comment-proposalId'}
                minHeightStr={'400px'}
                onChange={handleChange}
                imgArrayChange={handleImgArrayChange}
                title="Create Comment"
                loading={loading}
                onQuillInit={q => setQuill(q)}
                btnText="Submit"
                onButtonClick={submit}
                initContent={getDefault}
                placeholderText=""
              />
            </div>
          </div>
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <button
              className={classes.btnPreview}
              onClick={() => {
                generatePreviewContent();
              }}
            >
              Preview
            </button>
          </div>

          <CongratsDialog
            trigger={showCongratsDialog}
            onClose={() => {
              setShowCongratsDialog(false);
              navigate(`/proposal/${propId}`, { replace: false });
            }}
          />
        </Col>
      </Row>

      {/*{showProposalSuccessModal && propId && (*/}
      {/*    <ProposalSuccessModal*/}
      {/*        setShowProposalSuccessModal={setShowProposalSuccessModal}*/}
      {/*        proposalId={propId}*/}
      {/*        house={activeCommunity}*/}
      {/*        round={activeAuction}*/}
      {/*    />*/}
      {/*)}*/}
    </>
  );
};

export default ProposalInputs;
