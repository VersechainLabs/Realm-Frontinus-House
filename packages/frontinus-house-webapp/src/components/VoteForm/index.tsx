import {useAppDispatch, useAppSelector} from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { useTranslation } from 'react-i18next';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import BlotFormatter from 'quill-blot-formatter';
import ImageUploadModal from '../ImageUploadModal';
import ProposalInputs from '../ProposalInputs';
import {useAccount, useWalletClient} from 'wagmi';
import {useLocation, useNavigate} from 'react-router-dom';
import { isInfAuction } from '../../utils/auctionType';
import classes from './VoteForm.module.css';
import clsx from "clsx";
import {Col, Form, Row} from "react-bootstrap";
import InputFormGroup from "../InputFormGroup";
import QuillEditor from "../QuillEditor";
import {DeltaStatic, Quill} from "quill";
import {matchImg} from "../../utils/matchImg";
import {InfiniteAuctionProposal, Proposal, UpdatedProposal} from "@nouns/frontinus-house-wrapper/dist/builders";
import {appendProposal} from "../../state/slices/propHouse";
import {clearProposal} from "../../state/slices/editor";


const VoteForm: React.FC<{
    fields?: ProposalFields;
    onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
    const {
        fields,
        onDataChange,
    } = props;

    const data = useAppSelector(state => state.editor.proposal);
    const [editorBlurred, setEditorBlurred] = useState(false);
    const { t } = useTranslation();
    const { data: walletClient } = useWalletClient();
    const host = useAppSelector(state => state.configuration.backendHost);
    const client = useRef(new ApiWrapper(host));
    const [blurred, setBlurred] = useState(false);
    const [loading, setLoading] = useState(false);
    const [quill, setQuill] = useState<Quill | undefined>(undefined);
    const [content, setContent] = useState('');
    const dispatch = useAppDispatch();
    const { address: account } = useAccount();
    const navigate = useNavigate();


    useEffect(() => {
        client.current = new ApiWrapper(host, walletClient);
    }, [walletClient, host]);

    return (
        <>
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
                        <select>
                            <option value="1">Single Choice Voting</option>
                        </select>
                    </div>
                    <div className={classes.labelMargin}>
                        <div className={classes.desc}>
                            Choices
                        </div>
                        <div>
                            <div>
                                <div></div>
                                <div></div>
                            </div>
                            <div>
                                <div></div>
                                <div></div>
                            </div>
                        </div>

                    </div>

                        {/** CHOICE */}
                </Col>
            </Row>
        </>
    );
};

export default VoteForm;
