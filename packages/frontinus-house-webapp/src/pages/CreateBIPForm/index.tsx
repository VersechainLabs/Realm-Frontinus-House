import classes from './CreateBIPForm.module.css';
import {Row, Col, Container, Form} from 'react-bootstrap';
import Button, { ButtonColor } from '../../components/Button';
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import ProposalEditor from '../../components/ProposalEditor';
import DelegateEditor from '../../components/DelegateEditor';
import BipForm, {FormDataType} from '../../components/BipForm';
import { useNavigate } from 'react-router-dom';
import Preview from '../Preview';
import { clearProposal, patchProposal } from '../../state/slices/editor';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {InfiniteAuctionProposal, Proposal, TimedAuction,TimedBIP} from '@nouns/frontinus-house-wrapper/dist/builders';
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
import dayjs, {Dayjs, utc} from "dayjs";
import BIPPreview from "../../components/BIPPreview";
import { setAlert } from '../../state/slices/alert';
import { matchImg } from '../../utils/matchImg';
import LoadingIndicator from "../../components/LoadingIndicator";
import {LoadingButton} from "@mui/lab";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {nameToSlug} from "../../utils/communitySlugs";

const CreateBIPForm: React.FC<{
    fields?: ProposalFields;
    onDataChange: (data: Partial<ProposalFields>) => void;
}> = () => {

    // const utc = require('dayjs/plugin/utc');
    // dayjs.extend(utc)

    //data
    const [state, setState] = useState({
        title: '',
        content: '',
        voteType:1,
        voteOptions:["",""],
        voteStartTime: dayjs(),
        voteEndTime: "",
    });


    const host = useAppSelector(state => state.configuration.backendHost);
    const client = useRef(new ApiWrapper(host));
    const { address: account } = useAccount();
    const { data: walletClient } = useWalletClient();
    const [content, setContent] = useState('');
    const [endDate, setEndDate] = useState(dayjs().add(7, 'day'));
    const [dateValue, setDateValue] = useState('');
    const [publishLoading,setPublishLoading] = useState(false);


    const [imgArray, setImgArray] = useState(['']);



    const navigate = useNavigate();


    const { t } = useTranslation();
    // auction to submit prop to is passed via react-router from propse btn
    const location = useLocation();
    const [showPreview, setShowPreview] = useState(false);
    const [showStep1, setShowStep1] = useState(true);
    const [showStep2, setShowStep2] = useState(false);

    const [quill, setQuill] = useState<Quill | undefined>(undefined);
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const MIN_TITLE_LENGTH = 5;
    const MAX_TITLE_LENGTH = 100;
    const MAX_DESC_LENGTH = 20000;
    const [titleLength, setTitleLength] = useState(0);
    const [descLength, setDescLength] = useState(0);

    useEffect(() => {
        client.current = new ApiWrapper(host, walletClient);
    }, [walletClient, host,quill]);


    const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
        if (plainText.trim().length === 0) {
            if( !htmlContent ){
                setContent('');
                setDescLength(0);
            }else{
                setContent(htmlContent);
            }
        } else {
            setContent(htmlContent);
            setDescLength(plainText.trim().length);
        }
    };



    // const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    //     console.log(content);
    //     // if (plainText.trim().length === 0) {
    //     //     setContent('');
    //     // } else {
    //         setContent(htmlContent);
    //     // }
    // };

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
        let flag = checkStep1();
        if ( !flag ){
            return false;
        }

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

    const onClickPreview = ()=>{
        let flag = checkStep1();
        if ( !flag ){
            return false;
        }
        setShowStep1(false);
        setShowStep2(false);
        setShowPreview(true);
    }

    const onClickBack = ()=>{
        setShowStep1(true);
        setShowStep2(false);
        setShowPreview(false);
    }


    const onClickPreviewBack = ()=>{
        setShowStep1(true);
        setShowStep2(false);
        setShowPreview(false);
    }

    const setStartTime = (value: Dayjs | null) => {
        if ( !value ){
            return;
        }
        const utcValue = utc(value.format());
        setState(prevState => ({
            ...prevState,
            voteStartTime: utcValue.toDate(),
        }));
    };

    const setEndTime = (value: Dayjs | null) => {

        if ( !value ){
            return;
        }
        const utcValue = utc(value.format());
        console.log(value,utcValue,utcValue.toDate());
        setState(prevState => ({
            ...prevState,
            voteEndTime: utcValue.toDate(),
        }));
        setDateValue(state.voteStartTime.format('YYYY-MM-DD HH:mm') + ' ~ ' + utcValue.format('YYYY-MM-DD HH:mm'));
    };

    const setDayEndTime1 = () => {
        // if (!day) {
        //     return;
        // }
        const newDate = dayjs().add(1, 'day');
        console.log(newDate,newDate.toDate());
        // const utcValue = utc(newDate.format());
        setState(prevState => ({
            ...prevState,
            voteEndTime: newDate.toDate(),
        }));
        setEndDate(newDate);
        setDateValue(state.voteStartTime.format('YYYY-MM-DD HH:mm') + ' ~ ' + newDate.format('YYYY-MM-DD HH:mm'));
    };
    const setDayEndTime7 = () => {
        // if (!day) {
        //     return;
        // }
        const newDate = dayjs().add(7, 'day');
        console.log(newDate,newDate.toDate());
        // const utcValue = utc(newDate.format());
        setState(prevState => ({
            ...prevState,
            voteEndTime: newDate.toDate(),
        }));
        setEndDate(newDate);
        setDateValue(state.voteStartTime.format('YYYY-MM-DD HH:mm') + ' ~ ' + newDate.format('YYYY-MM-DD HH:mm'));
    };
    const setDayEndTime14 = () => {
        // if (!day) {
        //     return;
        // }
        const newDate = dayjs().add(14, 'day');
        console.log(newDate,newDate.toDate());
        // const utcValue = utc(newDate.format());
        setState(prevState => ({
            ...prevState,
            voteEndTime: newDate.toDate(),
        }));
        setEndDate(newDate);
        setDateValue(state.voteStartTime);
        setDateValue(state.voteStartTime.format('YYYY-MM-DD HH:mm') + ' ~ ' + newDate.format('YYYY-MM-DD HH:mm'));

    };
    const setDayEndTime30 = () => {
        // if (!day) {
        //     return;
        // }
        const newDate = dayjs().add(30, 'day');
        console.log(newDate,newDate.toDate());
        // const utcValue = utc(newDate.format());
        setState(prevState => ({
            ...prevState,
            voteEndTime: newDate.toDate(),
        }));
        setEndDate(newDate);
        setDateValue(state.voteStartTime);
        setDateValue(state.voteStartTime.format('YYYY-MM-DD HH:mm') + ' ~ ' + newDate.format('YYYY-MM-DD HH:mm'));
    };




    const checkStep1 = ()=>{
        //check title

        // console.log(content);

        if (content == '' ||content == '<p><br></p>' || state.title.length == 0){
            dispatch(setAlert({ type: 'error', message: "All fields must be filled!" }));
            return false;
        }
        if ( state.title.length < MIN_TITLE_LENGTH ){
            dispatch(setAlert({ type: 'error', message: "The minmum length of title is "+MIN_TITLE_LENGTH }));
            return false;
        }
        return true;
    }

    const checkStep2 = ()=>{
        //check title

        let len = 0;

        for(let i=0;i<state.voteOptions.length;i++){
            if(state.voteOptions[i].trim() == ''){
                continue;
            }

            if(state.voteOptions[i].length >= 500){
                dispatch(setAlert({ type: 'error', message: "Choice is too long!" }));
                return false;
            }

            len++;
        }

        if ( len < 2 ){
            dispatch(setAlert({ type: 'error', message: "Please input at least two choices!" }));
            return false;
        }
        // console.log(content);

        if ( !state.voteStartTime ){
            dispatch(setAlert({ type: 'error', message: "Please select the startTime" }));
            return false;
        }

        if ( !state.voteEndTime ){
            dispatch(setAlert({ type: 'error', message: "Please select the endTime" }));
            return false;
        }

        if ( state.voteEndTime <= state.voteStartTime){
            dispatch(setAlert({ type: 'error', message: "EndTime should be bigger than startTime" }));
            return false;
        }



        return true;
    }




    const onClickPublish = async ()=>{
        try {
            console.log(state.voteEndTime);
            if ( publishLoading ){
                return false;
            }


            let flag = checkStep2();
            if ( !flag ){
                return false;
            }


            let imgUrl = matchImg(imgArray, content);

            setPublishLoading(true);


            await client.current
                .createBIP(
                    new TimedBIP(
                        state.title,
                        state.voteType,
                        state.voteOptions,
                        state.voteStartTime,
                        state.voteEndTime,
                        content,
                        imgUrl
                    ),
                )
                .then((data:any) => {
                    setPublishLoading(false);
                    navigate("/bip/"+data.id+'-'+`${nameToSlug(data.title)}`);
                })

        } catch (e) {
            setPublishLoading(false);
        }
    }


    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
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
                                                <div className={classes.desc}>
                                                    Description
                                                    <span className={classes.characterCount}>
                                                          {descLength}/{MAX_DESC_LENGTH}
                                                        </span>
                                                </div>
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
                                                        initContent={""}
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
                                                <div className={classes.preview} onClick={onClickPreview}>Preview</div>
                                            </div>
                                        </Col>
                                    </Row>
                            }



                            {

                                <Row className={!showPreview && classes.hide}>
                                    <Col xl={12}>
                                        <BIPPreview
                                            onClickGoBack={onClickPreviewBack}
                                            title={state.title}
                                            description={content}
                                    />
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

                                                            <input
                                                                value={'Single Choice Voting'}
                                                                name={'title'}
                                                                className={classes.input}
                                                                type="text"
                                                                style={{
                                                                    height: '40px',
                                                                }}
                                                                readOnly={true}
                                                            />
                                                            {/*<select className={classes.voteType}>*/}
                                                            {/*    <option value="1">Single Choice Voting</option>*/}
                                                            {/*</select>*/}

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

                                                                            <input
                                                                                id="basic-button"
                                                                                aria-controls={open ? 'basic-menu' : undefined}
                                                                                aria-haspopup="true"
                                                                                aria-expanded={open ? 'true' : undefined}
                                                                                onClick={handleClick}
                                                                                className={classes.input}
                                                                                value={dateValue}
                                                                                type="text"
                                                                                style={{
                                                                                    height: '40px',
                                                                                }}
                                                                            />
                                                                            {/*<Button*/}
                                                                            {/*    id="basic-button"*/}
                                                                            {/*    aria-controls={open ? 'basic-menu' : undefined}*/}
                                                                            {/*    aria-haspopup="true"*/}
                                                                            {/*    aria-expanded={open ? 'true' : undefined}*/}
                                                                            {/*    onClick={handleClick}*/}
                                                                            {/*>*/}
                                                                            {/*    Dashboard*/}
                                                                            {/*</Button>*/}
                                                                            <Menu
                                                                                id="basic-menu"
                                                                                anchorEl={anchorEl}
                                                                                open={open}
                                                                                onClose={handleClose}
                                                                                MenuListProps={{
                                                                                    'aria-labelledby': 'basic-button',
                                                                                }}
                                                                            >
                                                                                <MenuItem
                                                                                    className={classes.meumMain}
                                                                                    onClick={setDayEndTime1}
                                                                                >
                                                                                        1 day later
                                                                                </MenuItem>
                                                                                <MenuItem
                                                                                    className={classes.meumMain}
                                                                                    onClick={setDayEndTime7}
                                                                                >
                                                                                    7 days later
                                                                                </MenuItem>
                                                                                <MenuItem
                                                                                    className={classes.meumMain}
                                                                                    onClick={setDayEndTime14}
                                                                                >
                                                                                    14 days later
                                                                                </MenuItem>
                                                                                <MenuItem
                                                                                    className={classes.meumMain}
                                                                                    onClick={setDayEndTime30}
                                                                                >
                                                                                    After a month
                                                                                </MenuItem>
                                                                                <MenuItem
                                                                                    className={classes.meumMain}
                                                                                >
                                                                                    <div>
                                                                                        <div className={classes.custTime}>
                                                                                            Custom time
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className={classes.timeMain}>
                                                                                               <div className={classes.custTime}> Start</div>
                                                                                                <DateTimePicker
                                                                                                    onChange={newValue => {
                                                                                                        setStartTime(newValue)
                                                                                                        // saveFormStart(newValue); // Save the value to the state as before
                                                                                                        // setProposingStartTime(newValue); // Save the value to the proposingStartTime state
                                                                                                    }}
                                                                                                    defaultValue={dayjs()}
                                                                                                    className={classes.input}
                                                                                                    minDate={dayjs()} //set minDate to the current date and time
                                                                                                    ampm={false}
                                                                                                />
                                                                                            </div>

                                                                                            <div className={classes.timeMain}>
                                                                                                <div className={classes.custTime}>End</div>
                                                                                                <div>
                                                                                                    <div>
                                                                                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                                                                                            <DemoContainer components={['DateTimePicker']}>
                                                                                                                <DateTimePicker
                                                                                                                    onChange={newValue => {
                                                                                                                        // saveFormStart(newValue); // Save the value to the state as before
                                                                                                                        setEndTime(newValue); // Save the value to the proposingStartTime state
                                                                                                                    }}
                                                                                                                    className={classes.input}
                                                                                                                    minDate={dayjs().add(7, 'day')} //set minDate to the current date and time
                                                                                                                    ampm={false}
                                                                                                                    value={endDate}

                                                                                                                />
                                                                                                            </DemoContainer>
                                                                                                        </LocalizationProvider>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className={classes.timeButton}>
                                                                                            <div className={classes.publishBtn}>

                                                                                                <LoadingButton
                                                                                                    onClick={handleClose}
                                                                                                    className={classes.continueBtn}
                                                                                                >
                                                                                                    {'Confirm'}
                                                                                                </LoadingButton>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                </MenuItem>
                                                                            </Menu>
                                                                        </DemoContainer>

                                                                    </LocalizationProvider>
                                                                </div>
                                                            </div>

                                                        </div>

                                                        <div className={classes.footer}>
                                                            <div className={classes.publishBtn}>

                                                                <LoadingButton
                                                                    loading={publishLoading}
                                                                    onClick={onClickPublish}
                                                                    className={classes.continueBtn}
                                                                >
                                                                    {publishLoading ? '':'Publish'}
                                                                </LoadingButton>
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
