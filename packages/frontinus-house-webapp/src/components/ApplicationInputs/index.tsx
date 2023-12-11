import classes from './ApplicationInputs.module.css';
import './ApplicationInputs.css';
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
import { FormDataType, FundReqDataType } from '../ApplicationEditor';
import { useAccount, useWalletClient } from 'wagmi';
import InputFormGroup from '../InputFormGroup';

import {matchImg} from "../../utils/matchImg";

import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import { DeltaStatic, Quill } from 'quill';
import { InfiniteAuctionProposal, Proposal } from '@nouns/frontinus-house-wrapper/dist/builders';
import { appendProposal } from '../../state/slices/propHouse';
import { clearProposal } from '../../state/slices/editor';
import ProposalSuccessModal from '../ProposalSuccessModal';
import { buildRoundPath } from '../../utils/buildRoundPath';
import DelegationCongrats from '../DelegationCongrats';
import { setAlert } from '../../state/slices/alert';
import {LoadingButton} from "@mui/lab";
import ConnectButton from "../ConnectButton";
import {nameToSlug} from "../../utils/communitySlugs";


const ApplicationInputs: React.FC<{
  formData: FormDataType[];
  fundReqData: FundReqDataType;
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const { formData, fundReqData, onDataChange } = props;

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState<number | undefined>();

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

  const [imgArray, setImgArray] = useState(['']);
  const navigate = useNavigate();
  const location = useLocation();
  const activeAuction = location.state.auction;
  const activeCommunity = location.state.community;
  const [showProposalSuccessModal, setShowProposalSuccessModal] = useState(false);
  const [propId, setPropId] = useState<null | number>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quill, setQuill] = useState<Quill | undefined>(undefined);
  const dispatch = useAppDispatch();
  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host, walletClient));
  const [openDelegationCongrats, setOpenDelegationCongrats] = useState(false);
  const [showDelegationCongrats, setShowDelegationCongrats] = useState(false);

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

  const handleImgArrayChange = (img : string) => {

    let ary = [...imgArray];
    ary.push(img);
    setImgArray(ary)

  };

  const submit = async () => {
    try {
      const titleFieldValue = formData[0].fieldValue;
      const tldrFieldValue = formData[1].fieldValue;

      if (
        titleFieldValue.trim().length === 0 ||
        tldrFieldValue.trim().length === 0 ||
        content.trim().length === 0
      ) {
        const errorMessage = 'You must complete all the fields before submit!';
        console.log('Error message to be dispatched:', errorMessage);
        dispatch(setAlert({ type: 'error', message: errorMessage }));
        return;
      }

      if (content.length === 0 || !account) {
        setOpenDelegationCongrats(true);
        return;
      }

      setLoading(true);

    let imgUrl = matchImg(imgArray, content);
    let newProp: Proposal | InfiniteAuctionProposal;
    newProp = new Proposal(
        formData[0].fieldValue,
        content,
        formData[1].fieldValue,
        activeAuction.id,
        'auction',
        imgUrl
    );

      const proposal = await client.current.createApplication(newProp);

      // setPropId(proposal.id);
      // dispatch(appendProposal({ proposal }));
      // dispatch(clearProposal());
      // setShowProposalSuccessModal(true);
      setOpenDelegationCongrats(true);
      setShowDelegationCongrats(true);
      setLoading(false);
    } catch (e) {

      // console.log(typeof(e))

      if ( typeof(e) == 'string' ){
        dispatch(
          setAlert({
            type: 'error',
            message: e,
          }),
        );
      }

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
          <div className={classes.description}>Description</div>
          <div className={'propEditor'}>
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
              placeholderText=""
            />
            {account ? (
                loading ? (
                        <LoadingButton
                            loading={true}
                            id="out-button"
                            style={{
                              marginRight:'0px'
                            }}
                        >
                        </LoadingButton>

                        // <div
                        //     id="custom-button"
                        //     className={'btnDisabled'}
                        //
                        // >
                        //   <span><img src="/loading.gif" alt="" width={'40'}/></span>
                        // </div>
                    ) :

                    (<div
                        id="out-button"
                        onClick={submit}
                    >
                      <span>Submit</span>
                    </div>)

            ) : (
                <div  id="custom-button-connect">
                  <ConnectButton
                  />
                </div>
            )}
          </div>
          <DelegationCongrats
            trigger={showDelegationCongrats}
            onClose={() => {
              setShowDelegationCongrats(false);
              navigate(`/delegateDetails/${activeAuction.id}-${nameToSlug(activeAuction.title)}`);
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

export default ApplicationInputs;
