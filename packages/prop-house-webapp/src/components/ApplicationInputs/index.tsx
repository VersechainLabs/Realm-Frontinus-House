import classes from './ApplicationInputs.module.css';
import './ApplicationInputs.css';
import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import {useAppDispatch, useAppSelector} from '../../hooks';
import {useLocation, useNavigate} from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import '../../quill.css';
import clsx from 'clsx';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import validateInput from '../../utils/validateInput';
import { ProposalFields } from '../../utils/proposalFields';
import { FormDataType, FundReqDataType } from '../ApplicationEditor';
import {useAccount, useSigner} from 'wagmi';
import InputFormGroup from '../InputFormGroup';
import QuillEditor, {EMPTY_DELTA} from "../QuillEditor";
import {DeltaStatic, Quill} from "quill";
import {InfiniteAuctionProposal, Proposal} from "@nouns/prop-house-wrapper/dist/builders";
import {appendProposal} from "../../state/slices/propHouse";
import {clearProposal} from "../../state/slices/editor";
import ProposalSuccessModal from "../ProposalSuccessModal";
import {buildRoundPath} from "../../utils/buildRoundPath";
import {
  setAlert
} from '../../state/slices/alert';


const ApplicationInputs: React.FC<{
  formData: FormDataType[];
  fundReqData: FundReqDataType;
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const {
    formData,
    fundReqData,
    onDataChange,
  } = props;

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
  const { data: signer } = useSigner();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host, signer));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      setContent('');
    } else {
      setContent(htmlContent);
    }
  };

  const submit = async () => {

    if (content.length === 0 || !account) {
      return;
    }

    setLoading(true);

    let newProp: Proposal | InfiniteAuctionProposal;

    newProp = new Proposal(formData[0].fieldValue, content, formData[1].fieldValue, activeAuction.id);

    try {
      const proposal = await client.current.createApplication(newProp);

      setPropId(proposal.id);
      dispatch(appendProposal({ proposal }));
      dispatch(clearProposal());
      // setShowProposalSuccessModal(true);
      navigate(`/delegateDetails/${(activeAuction.id)}`)
      setLoading(false);

    }
    catch (e) {
      dispatch(setAlert({
        type : 'error',
        message: e
      }))
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
          <div className={"propEditor"}>
            <div className={classes.description}>
              Description
            </div>
            <QuillEditor
                widgetKey={'Comment-proposalId'}
                minHeightStr={'400px'}
                onChange={handleChange}
                title='Create Comment'
                loading={loading}
                onQuillInit={(q) => setQuill(q)}
                btnText='Submit'
                onButtonClick={submit}
            />
          </div>

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
