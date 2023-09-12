import classes from './RenderBIPFields.module.css';
import { Row, Col } from 'react-bootstrap';
import proposalFields from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import {
    StoredAuctionBase,
    StoredProposal,
    BIPVote,
    StoredProposalWithVotes
} from '@nouns/frontinus-house-wrapper/dist/builders';
import clsx from "clsx";
import formatServerDate from '../../utils/commentTime';
import '../QuillEditor/quill.snow.css';
import '../QuillEditor/QuillEditor.module.css';
import {useTranslation} from "react-i18next";
import CastVote from "../CastVote";
import VoteResults from "../VoteResults";

import {Container} from "react-bootstrap";
import {LoadingButton} from "@mui/lab";
import {Vote} from "@nouns/frontinus-house-wrapper/dist/builders";
import {useAppDispatch, useAppSelector} from "../../hooks";
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import {useAccount, useWalletClient} from "wagmi";
import React, {useEffect, useRef, useState} from "react";
import {setAlert} from "../../state/slices/alert";
import VoteLists from "../VoteLists";
import {setActiveBIP} from "../../state/slices/propHouse";


export interface RenderedBIPProps {
    bip: any;
    backButton?: React.ReactNode;
}

const RenderedBIPFields: React.FC<RenderedBIPProps> = props => {
    const { backButton, bip } = props;
    const userAddress = useAppSelector(state => state.user.address);
    const { t } = useTranslation();
    const [disabled, setDisabled] = useState(false);

    const {address: account} = useAccount();

    const { data: walletClient } = useWalletClient();
    const backendHost = useAppSelector(state => state.configuration.backendHost);
    const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
    const dispatch = useAppDispatch();


    useEffect(() => {
        backendClient.current = new ApiWrapper(backendHost, walletClient);
    }, [walletClient, backendHost]);


    const onClickVote = async (optionId:number)=>{
        // console.log('5555');
        // console.log(id);
            try {

                if (  optionId == 0 ){
                    dispatch(setAlert({ type: 'error', message: "Please select a choice to vote" }));
                    return false;
                }

                if ( disabled  ){
                    return false;
                }

                setDisabled(true);

                await backendClient.current.createBIPVote(
                    new BIPVote(
                        bip.id,
                        Number(optionId)
                    )
                );

                const freshBIP = await backendClient.current.getBIP(
                    Number(bip.id),
                    account,
                );

                dispatch(setActiveBIP(freshBIP));
                //window.location.reload();

            } catch (e) {

                if ( typeof(e) == 'string'){
                    dispatch(setAlert({ type: 'error', message: e }));
                }

                setDisabled(false);

            } finally {

                setDisabled(false);

            }


    }


    const onCancelVote = async ()=>{
        // console.log('5555');
        // console.log(id);
        try {

            if ( disabled  ){
                return false;
            }

            setDisabled(true);

            await backendClient.current.deleteVote(
                new BIPVote(
                    bip.id,
                    Number(optionId)
                )
            );

            const freshBIP = await backendClient.current.getBIP(
                Number(bip.id),
                account,
            );

            dispatch(setActiveBIP(freshBIP));
            //window.location.reload();

        } catch (e) {

            if ( typeof(e) == 'string'){
                dispatch(setAlert({ type: 'error', message: e }));
            }

            setDisabled(false);

        } finally {

            setDisabled(false);

        }


    }


    return (
        <>
            <Col xl={12} className="proposalCopy">
                <div className={classes.headerContainer}>
                    <div className={classes.backBtnContainer}>{backButton && backButton}</div>
                    <div className={classes.headerBottomContainer}>
                        <div>
                            <h1 className={clsx('frontinusTitle')}>{bip.title}</h1>

                            {bip.address && bip.id && (
                                <div className={classes.subinfo}>
                                    <div className={classes.propBy}>
                                        <span>{t('propCap')}</span>
                                        {t('by')}
                                        <div className={classes.submittedBy}>
                                            <EthAddress address={bip.address} className={classes.submittedBy} />
                                        </div>
                                        <span>{' • '} {formatServerDate(bip.createdDate)}</span>
{/*                                        {userAddress && userAddress === bip.address && (<span*/}
{/*                                            onClick={editProposal}*/}
{/*                                            className={classes.editBy}>{' • '}*/}
{/*                                            <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">*/}
{/*<path d="M10.184 1.63622C10.3435 1.44217 10.5389 1.28549 10.758 1.17608C10.9771 1.06667 11.2151 1.00691 11.457 1.00056C11.6988 0.994219 11.9393 1.04143 12.1631 1.13922C12.387 1.23701 12.5894 1.38324 12.7577 1.5687C12.9259 1.75416 13.0562 1.9748 13.1405 2.21671C13.2247 2.45861 13.261 2.71651 13.2471 2.97414C13.2332 3.23177 13.1693 3.48351 13.0596 3.71349C12.9498 3.94347 12.7966 4.14667 12.6095 4.31028L11.4125 5.58711L8.938 2.94665L10.1753 1.62688L10.184 1.63622ZM5.22538 12.1859V12.1878H2.75V9.5464L8.31938 3.60653L10.7939 6.24699L5.22538 12.1859ZM1 13.1333H15V15H1V13.1333Z" fill="#D0A059"/>*/}
{/*</svg> Edit*/}
{/*                      </span>)}*/}
                                    </div>
                                </div>
                            )}


                        </div>
                    </div>
                </div>

                <div className={classes.proposalBody}>
                    {/*{bip.tldr && (*/}
                    {/*    <div className={classes.tldr}>*/}
                    {/*        <h2 >{t('tldr')}</h2>*/}
                    {/*        <ReactMarkdown className={`${classes.markdown} ${classes.tldrContent}`} children={bip.tldr}></ReactMarkdown>*/}
                    {/*    </div>*/}
                    {/*)}*/}

                    <h2>{t('description')}</h2>
                    <div
                        className="ql-editor"
                        dangerouslySetInnerHTML={{ __html: bip.content}}
                    />
                    {/*
             * We sanitize HTML coming from rich text editor to prevent xss attacks.
             *
             * <Markdown/> component used to render HTML, while supporting Markdown.
             */}
                    {/*<Markdown>*/}
                    {/*  {sanitizeHtml(fields.what, {*/}
                    {/*    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),*/}
                    {/*    allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(['data']),*/}
                    {/*    allowedAttributes: {*/}
                    {/*      img: ['src', 'alt', 'height', 'width'],*/}
                    {/*      a: ['href', 'target'],*/}
                    {/*    },*/}
                    {/*    allowedClasses: {*/}
                    {/*      code: ['language-*', 'lang-*'],*/}
                    {/*      pre: ['language-*', 'lang-*'],*/}
                    {/*    },*/}
                    {/*    // edge case: handle ampersands in img links encoded from sanitization*/}
                    {/*  }).replaceAll('&amp;', '&')}*/}
                    {/*</Markdown>*/}
                </div>

                <div className={classes.voteBlock}>

                    <CastVote
                        onClickVote={onClickVote}
                        onCancelVote={onCancelVote}
                        options={bip.bipOptions}
                        voteState={bip.voteState}
                        voteOptionId={bip.currentUserVotedOptionId}
                        endTime={bip.endTime}
                        loading={disabled}
                        code={bip.voteState.code}
                    />

                    <VoteResults
                        options={bip.bipOptions}
                        quorum={bip.quorum}
                        voteCount={bip.voteCount}
                        quorumPercentage={bip.quorumPercentage}
                        symbol={'BIBLIO'}
                    />

                </div>

                <div className={classes.voteLists}>
                    <VoteLists
                        bipVotes={bip.bipVotes}
                        voteCount={bip.voteCount}
                    />
                </div>

            </Col>
        </>
    );
};

export default RenderedBIPFields;
