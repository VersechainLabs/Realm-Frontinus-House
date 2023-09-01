import classes from './CreateBIPForm.module.css';
import {Row, Col, Container, Form} from 'react-bootstrap';
import Button, { ButtonColor } from '../../components/Button';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import ProposalEditor from '../../components/ProposalEditor';
import DelegateEditor from '../../components/DelegateEditor';
import BipForm, {FormDataType} from '../../components/BipForm';

import Preview from '../Preview';
import { clearProposal, patchProposal } from '../../state/slices/editor';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {InfiniteAuctionProposal, Proposal, TimedAuction} from '@nouns/frontinus-house-wrapper/dist/builders';
import { appendProposal } from '../../state/slices/propHouse';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import isAuctionActive from '../../utils/isAuctionActive';
import { ProposalFields } from '../../utils/proposalFields';
import { useTranslation } from 'react-i18next';
import ConnectButton from '../../components/ConnectButton';
import { useAccount, useWalletClient } from 'wagmi';
import { infRoundBalance } from '../../utils/infRoundBalance';
import VoteForm from "../../components/VoteForm";
import clsx from "clsx";
import QuillEditor from "../../components/QuillEditor";
import InputFormGroup from "../../components/InputFormGroup";
import validateInput from "../../utils/validateInput";
import {DeltaStatic, Quill} from "quill";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DemoContainer} from "@mui/x-date-pickers/internals/demo";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import dayjs from "dayjs";
import {setAlert} from "../../state/slices/alert";

const CreateBIPForm: React.FC<{
    fields?: ProposalFields;
    onDataChange: (data: Partial<ProposalFields>) => void;
}> = () => {


    //data
    const [state, setState] = useState({
        title: '',
        content: '',
        voteType:1,
        voteOptions:["",""],
        voteStartTime: new Date(),
        voteEndTime: new Date(),
    });


    const host = useAppSelector(state => state.configuration.backendHost);
    const client = useRef(new ApiWrapper(host));
    const { address: account } = useAccount();
    const { data: walletClient } = useWalletClient();

    useEffect(() => {
        client.current = new ApiWrapper(host, walletClient);
    }, [walletClient, host]);


    const [content, setContent] = useState('');


    const { t } = useTranslation();
    // auction to submit prop to is passed via react-router from propse btn
    const location = useLocation();
    const [showPreview, setShowPreview] = useState(false);
    const [showStep1, setShowStep1] = useState(true);
    const [showStep2, setShowStep2] = useState(false);
    const [quill, setQuill] = useState<Quill | undefined>(undefined);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const MAX_TITLE_LENGTH = 100;
    const [titleLength, setTitleLength] = useState(0);


    const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
        if (plainText.trim().length === 0) {
            setContent('');
        } else {
            setContent(htmlContent);
        }
        console.log(content);
    };

    const handleImgArrayChange = (img: string) => {
        let ary = [...imgArray];
        ary.push(img);
        setImgArray(ary);
    };

    const saveFormTitle = (value: string) => {
        const limitedTitle = value.slice(0, MAX_TITLE_LENGTH);
        setState(prevState => ({ ...prevState, title: limitedTitle }));
        setTitleLength(limitedTitle.length); // Update the titleLength state with the current input length
    };

    const onClickContinue = () => {
        setShowStep1(false);
        setShowStep2(true);
    }

    const onClickAddOption = ()=>{
        state.voteOptions.push("")
        setState(prevState => ({ ...prevState, voteOptions: state.voteOptions }));
    }

    const saveOption = (value:string,k:number)=>{
        state.voteOptions[k] = value;
        setState(prevState => ({ ...prevState, voteOptions: state.voteOptions }));
    }

    const onClickDelOption = (k:number) =>{
        state.voteOptions.splice(k, 1);
        setState(prevState => ({ ...prevState, voteOptions: state.voteOptions }));
    }


    const onClickBack = ()=>{
        setShowStep1(true);
        setShowStep2(false);
    }

    const onClickPublish = async ()=>{
        try {
            console.log(content);
            // const round = await client.current
            //     .createAuction(
            //
            //     )
            //     .then(() => {
            //
            //     })
            //     .catch(e => {
            //
            //     });
        } catch (e) {


        }
    }

    return (
        <>
                        <Container>
                            {
                                    <Row className={!showStep1 && classes.hide}>
                                        <Col xl={12}>
                                            <div className={clsx(classes.nominateText, 'frontinusTitle')}>Creating your proposal</div>
                                            <div className={classes.nominateDesc}></div>
                                            <div className={clsx(classes.desc)}>
                                                {/** TITLE */}
                                                <div className={classes.labelMargin}>
                                                    <div className={classes.desc}>
                                                        Title
                                                        <span className={classes.characterCount}>
                                                          {titleLength}/{MAX_TITLE_LENGTH}
                                                        </span>
                                                    </div>

                                                    <input
                                                        onChange={event => saveFormTitle(event.target.value)}
                                                        value={state.title}
                                                        name={'title'}
                                                        className={classes.input}
                                                        type="text"
                                                        style={{
                                                            height: '40px',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            {/** DESCRIPTION */}
                                            <div className={'bipEditor'}>
                                                <div className={classes.desc}>Description</div>
                                                <div>
                                                    <QuillEditor
                                                        widgetKey={'BIP'}
                                                        minHeightStr={'200px'}
                                                        onChange={handleChange}
                                                        imgArrayChange={handleImgArrayChange}
                                                        title="Create Comment"
                                                        loading={false}
                                                        onQuillInit={(q)  => setQuill(q)}
                                                        btnText=""
                                                        onButtonClick={()=>function () {}}
                                                        initContent={content}
                                                        placeholderText=""
                                                    />
                                                </div>
                                            </div>
                                            <div style={{display:"flex"}}>
                                                <Button
                                                    classNames={classes.continueBtn}
                                                    text={'Continue'}
                                                    onClick={onClickContinue}
                                                />
                                                <div className={classes.preview}>Preview</div>
                                            </div>
                                        </Col>
                                    </Row>
                            }
                            {
                                    <Row className={!showStep2 && classes.hide}>
                                        <Col xl={12}>
                                                <div className={clsx(classes.nominateText, 'frontinusTitle')}>Voting</div>
                                                <div className={classes.nominateDesc}></div>
                                                <Row>
                                                    <Col xl={12}>
                                                        <div>
                                                            {/** TYPE */}
                                                        </div>
                                                        <div className={classes.labelMargin}>
                                                            <div className={classes.desc}>
                                                                Type
                                                            </div>
                                                            <select className={classes.voteType}>
                                                                <option value="1">Single Choice Voting</option>
                                                            </select>
                                                        </div>
                                                        <div className={classes.labelMargin}>
                                                            <div className={classes.desc}>
                                                                Choices
                                                            </div>
                                                            {
                                                                state.voteOptions.map(function (value, k) {
                                                                    return (
                                                                        <div className={classes.options} key={k}>
                                                                            <div className={classes.option}>
                                                                                <input
                                                                                    onChange={event => saveOption(event.target.value,k)}
                                                                                    value={value}
                                                                                    name={'title'}
                                                                                    className={classes.input}
                                                                                    type="text"
                                                                                    style={{
                                                                                        height: '40px',
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            {
                                                                                (state.voteOptions.length > 2) &&
                                                                                (<div className={classes.close} onClick={e => onClickDelOption(k) }>
                                                                                    <img src="/close.png" alt="close"/>
                                                                                </div>)
                                                                            }
                                                                        </div>
                                                                    );
                                                                })
                                                            }
                                                            <div className={classes.addBar} onClick={onClickAddOption}>
                                                                <div>
                                                                    <img src="/add.png" alt=""/>
                                                                </div>
                                                                <div style={{marginLeft:"10px"}}>ADD OPTION</div>
                                                            </div>


                                                        </div>

                                                        {/** time */}
                                                        <div className={clsx(classes.timeBlock,classes.labelMargin)}>
                                                            <div className={classes.leftTime}>
                                                                <div>Start time</div>
                                                                <div>
                                                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                        <DemoContainer components={['DateTimePicker']}>
                                                                            <DateTimePicker
                                                                                onChange={newValue => {
                                                                                    // saveFormStart(newValue); // Save the value to the state as before
                                                                                    // setProposingStartTime(newValue); // Save the value to the proposingStartTime state
                                                                                }}
                                                                                className={classes.input}
                                                                                minDate={dayjs()} //set minDate to the current date and time
                                                                                ampm={false}
                                                                            />
                                                                        </DemoContainer>
                                                                    </LocalizationProvider>
                                                                </div>
                                                            </div>
                                                            <div className={classes.rightTime}>
                                                                <div>End time</div>
                                                                <div>
                                                                    <div>
                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                            <DemoContainer components={['DateTimePicker']}>
                                                                                <DateTimePicker
                                                                                    onChange={newValue => {
                                                                                        // saveFormStart(newValue); // Save the value to the state as before
                                                                                        // setProposingStartTime(newValue); // Save the value to the proposingStartTime state
                                                                                    }}
                                                                                    className={classes.input}
                                                                                    minDate={dayjs()} //set minDate to the current date and time
                                                                                    ampm={false}
                                                                                />
                                                                            </DemoContainer>
                                                                        </LocalizationProvider>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className={classes.footer}>
                                                            <div className={classes.publishBtn}>
                                                                <Button
                                                                    classNames={classes.continueBtn}
                                                                    text={'Publish'}
                                                                    onClick={onClickPublish}
                                                                />
                                                            </div>

                                                            <div className={classes.back} onClick={onClickBack}>Back</div>
                                                        </div>



                                                    </Col>
                                                </Row>
                                        </Col>
                                    </Row>
                            }


                        </Container>

        </>
    );
};

export default CreateBIPForm;
