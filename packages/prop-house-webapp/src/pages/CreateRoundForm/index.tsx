import classes from './CreateRoundForm.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useSigner } from 'wagmi';
import {nameToSlug} from "../../utils/communitySlugs";
import { TimedAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Link, useNavigate } from 'react-router-dom';

const CreateRound: React.FC<{}> = () => {
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
        numWinners: 0,
        currencyType: "",
        fundingAmount: 0,
        visible: true,
        community: 1,
        communityId: 1,
        balanceBlockTag: 0,
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
    const saveFormType = (value:string) => {
        state.currencyType = value;
        console.log(state);
    }
    const saveFormNum = (value:string) => {
        state.numWinners = parseInt(value);
        console.log(state);
    }
    const saveFormAmount = (value:string) => {
        state.fundingAmount = parseInt(value);
        console.log(state);
    }



    const handleSubmit = async (e:any) => {
        //该方法阻止表单的提交
        e.preventDefault();

        const round = await client.current.createAuction(new TimedAuction(
            true,
            state.title,
            state.startTime,
            state.proposalEndTime,
            state.votingEndTime,
            state.fundingAmount,
            state.currencyType,
            state.numWinners,
            state.community,
            state.communityId,
            state.balanceBlockTag,
            state.description,
        ));
        console.log(round);
        navigate('/frontinus');

    }


  return (
      <div  className={classes.blackBg}>
          <Container>
              <Row>
                  <form onSubmit={handleSubmit}>
                  <div className={classes.title}>
                      Round creation
                  </div>
                  <div className={classes.desc}>
                      Use this form to create a new round. Please visit our Discord if you have any questions: https://discord.com/invite/SKPzM8GHts.
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          What is the round name? (Please use only standard letters, no special characters such as dashes or question marks)*
                      </div>

                      <input onChange={event => saveFormTitle(event.target.value)} name={'title'} className={classes.input} type="text"/>
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          What is the round description? (Please use a markdown editor to format your description) *
                      </div>

                      <input onChange={event => saveFormDesc(event.target.value)} name={'description'} className={classes.input} type="text"/>
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
                          When does the round voting period end? (exact date and time in UTC)*
                      </div>

                      <input onChange={event => saveFormVote(event.target.value)} name={'votingEndTime'} className={classes.input} type="text"/>
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          How many winners are there?*
                      </div>

                      <input onChange={event => saveFormNum(event.target.value)} name={'numWinners'} className={classes.input} type="text"/>
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          What is the symbol for the currency being used as the award? (eg $ETH, $LORDS))*
                      </div>

                      <input onChange={event => saveFormType(event.target.value)} name={'currencyType'} className={classes.input} type="text"/>
                  </div>
                  <div className={classes.labelMargin}>
                      <div className={classes.desc}>
                          How much of the award currency does each winner get?*
                      </div>

                      <input onChange={event => saveFormAmount(event.target.value)} name={'fundingAmount'} className={classes.input} type="text"/>
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

export default CreateRound;
