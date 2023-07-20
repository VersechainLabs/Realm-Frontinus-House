import classes from './CreateDelegateForm.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useSigner } from 'wagmi';
import {nameToSlug} from "../../utils/communitySlugs";
import { TimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Link, useNavigate } from 'react-router-dom';

import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const CreateDelegateForm: React.FC<{}> = () => {
    const host = useAppSelector(state => state.configuration.backendHost);
    const client = useRef(new PropHouseWrapper(host));
    const { data: signer } = useSigner();
    useEffect(() => {
        client.current = new PropHouseWrapper(host, signer);
    }, [signer, host]);
    const navigate = useNavigate();

    const state  = {
        description: "",
        title: "",
        startTime: new Date("") ,
        endTime: new Date("") ,
        proposalEndTime: new Date("") ,
        votingEndTime:  new Date("") ,
    }

    const saveFormTitle = (value:string) => {
        state.title = value;
        console.log(state);
    }
    const saveFormDesc = (value:string) => {
        state.description = value;
        console.log(state);
    }
    const saveFormStart = (value:any) => {
        state.startTime = new Date(value);
        console.log(state);
    }
    const saveFormProposal = (value:any) => {
        // state.proposalEndTime = Date.parse(value);
        state.proposalEndTime = new Date(value);
        console.log(state);
    }
    const saveFormVote = (value:any) => {
        state.votingEndTime = new Date(value);
        console.log(state);
    }
    const saveFormEnd = (value:any) => {
        state.endTime = new Date(value);
        console.log(state);
    }



    const handleSubmit = async (e:any) => {
        //该方法阻止表单的提交
        e.preventDefault();

        const round = await client.current.createDelegateAuction(
            state
        );
        console.log(round);
        navigate('/frontinus');

    }


  return (
      <div  className={classes.blackBg}>
          <Container>
              <Row>
                  <form onSubmit={handleSubmit}>
                  <div className={classes.title}>
                      Delegate Selection Creation
                  </div>
                  <div className={classes.desc}>
                      Use this form to create a new delegate selection round. Please visit our Discord if you have any questions: https://discord.gg/uQnjZhZPfu.
                  </div>

                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          What is the selection round name? (Please use only standard letters, no special characters such as dashes or question marks)*
                      </div>

                      <input onChange={event => saveFormTitle(event.target.value)} name={'title'} className={classes.input} type="text"/>
                  </div>

                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          What is the description of this round of delegate selection? (Please use a markdown editor to format your description) *
                      </div>

                      <textarea rows={4} onChange={event => saveFormDesc(event.target.value)} name={'description'} className={classes.input} />
                  </div>
                      <div className={classes.flexDiv}>


                          <div className={classes.dateMain}>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          When does the delegation round start? (exact date and time in UTC)*
                      </div>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DateTimePicker']}>
                              <DateTimePicker onChange={(newValue) => saveFormStart(newValue)} className={classes.input} />
                          </DemoContainer>
                      </LocalizationProvider>
                  </div>

                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          When does the round voting period start? (exact date and time in UTC)*
                      </div>


                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DateTimePicker']}>
                              <DateTimePicker onChange={(newValue) => saveFormProposal(newValue)} className={classes.input} />
                          </DemoContainer>
                      </LocalizationProvider>
                  </div>
                  <div className={classes.labelMargin}>

                      <div className={classes.desc}>
                          When does the round voting period end? (exact date and time in UTC)*
                      </div>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DateTimePicker']}>
                              <DateTimePicker onChange={(newValue) => saveFormVote(newValue)} className={classes.input} />
                          </DemoContainer>
                      </LocalizationProvider>
                  </div>

                  <div className={classes.labelMargin}>

                      <div className={classes.desc}>
                          When does the delegation round end? (exact date and time in UTC)*
                      </div>

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DemoContainer components={['DateTimePicker']}>
                              <DateTimePicker onChange={(newValue) => saveFormEnd(newValue)} className={classes.input} />
                          </DemoContainer>
                      </LocalizationProvider>
                  </div>
                          </div>
                          <div className={classes.paddingTop}>
                              <div className={classes.xian+' '+classes.xian1}>

                              </div>
                              <div className={classes.flexDiv}>
                                  <div className={classes.qiu}>

                                  </div>
                                  <div className={classes.qiuDesc}>
                                      Start time for proposal submissions
                                  </div>
                              </div>

                              <div className={classes.xian+' '+classes.xian2}>

                              </div>
                              <div className={classes.flexDiv}>
                                  <div className={classes.qiu}>

                                  </div>
                                  <div className={classes.qiuDesc}>
                                      Voting Start Time
                                  </div>
                              </div>
                              <div className={classes.xian+' '+classes.xian3}>

                              </div>
                              <div className={classes.flexDiv}>
                                  <div className={classes.qiu}>

                                  </div>
                                  <div className={classes.qiuDesc}>
                                      Voting End Time
                                  </div>
                              </div>
                              <div className={classes.xian+' '+classes.xian3}>

                              </div>
                              <div className={classes.flexDiv}>
                                  <div className={classes.qiu}>

                                  </div>
                                  <div className={classes.qiuDesc}>
                                      Delegation End Time
                                  </div>
                              </div>
                              <div className={classes.xian+' '+classes.xian4}>

                              </div>
                          </div>
                      </div>
                  <button className={classes.button}>
                      Submit
                  </button>
                  </form>
              </Row>
          </Container>
      </div>

  );
};

export default CreateDelegateForm;
