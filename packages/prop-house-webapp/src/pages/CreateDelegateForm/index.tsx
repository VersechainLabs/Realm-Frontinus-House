import classes from './CreateDelegateForm.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useSigner } from 'wagmi';
import {nameToSlug} from "../../utils/communitySlugs";
import { TimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Link, useNavigate } from 'react-router-dom';

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
        proposalEndTime: new Date("") ,
        votingEndTime:  new Date("") ,
        num: 0,
        ownerInfo: '',
    }

    const saveFormTitle = (value:string) => {
        state.title = value;
        console.log(state);
    }
    const saveFormDesc = (value:string) => {
        state.description = value;
        console.log(state);
    }
    const saveFormStart = (value:string) => {
        state.startTime = new Date(value);
        console.log(state);
    }
    const saveFormProposal = (value:string) => {
        // state.proposalEndTime = Date.parse(value);
        state.proposalEndTime = new Date(value);
        console.log(state);
    }
    const saveFormVote = (value:string) => {
        state.votingEndTime = new Date(value);
        console.log(state);
    }

    const saveFormNum = (value:string) => {
        state.num = parseInt(value);
        console.log(state);
    }
    const saveFormOwner = (value:string) => {
        state.ownerInfo = value;
        console.log(state);
    }



    const handleSubmit = async (e:any) => {
        //该方法阻止表单的提交
        e.preventDefault();

        const round = await client.current.createDelegateAuction(
            state
        );
        console.log(round);
        // navigate('/frontinus');

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
                      Use this form to create a new delegate selection round. Please visit our Discord if you have any questions: https://discord.com/invite/SKPzM8GHts.
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

                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          When does the round proposing period start? (exact date and time in UTC)*
                      </div>

                      <input onChange={event => saveFormStart(event.target.value)} name={'startTime'} className={classes.input} type="text"/>
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          When does the round voting period start? (exact date and time in UTC)*
                      </div>

                      <input onChange={event => saveFormProposal(event.target.value)} name={'proposalEndTime'} className={classes.input} type="text"/>
                  </div>


                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          How many delegates are to be selected in this round?*
                      </div>

                      <input onChange={event => saveFormNum(event.target.value)} name={'votingEndTime'} className={classes.input} type="text"/>
                  </div>

                 <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          Who is voting on this round? (Respond with NFT/ERC20 contract address or specific wallet addresses)*
                      </div>

                      <input onChange={event => saveFormOwner(event.target.value)} name={'votingEndTime'} className={classes.input} type="text"/>
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
