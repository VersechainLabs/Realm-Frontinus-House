import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import proposalFields from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import { useTranslation } from 'react-i18next';
import { StoredAuctionBase, StoredProposal } from '@nouns/frontinus-house-wrapper/dist/builders';
import { BiAward } from 'react-icons/bi';
import clsx from "clsx";
import formatServerDate from '../../utils/commentTime';
import '../QuillEditor/quill.snow.css';
import '../QuillEditor/QuillEditor.module.css';
import { useAppDispatch, useAppSelector } from '../../hooks';
import {setProposalData} from "../../state/slices/proposal";
import {useNavigate} from "react-router-dom";
import {setActiveCommunity, setActiveProposals, setActiveRound} from "../../state/slices/propHouse";
import {useEffect, useRef} from "react";
import {ApiWrapper} from "@nouns/frontinus-house-wrapper";
import {useWalletClient} from "wagmi";
import { clearProposal, updateProposal } from '../../state/slices/editor';



export interface RenderedProposalProps {
  proposal: StoredProposal;
  backButton?: React.ReactNode;
  community?: any;
  round?: StoredAuctionBase;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = props => {
  const { proposal, backButton, round } = props;
  const { t } = useTranslation();
  const fields = proposalFields(proposal);
  const host = useAppSelector(state => state.configuration.backendHost);
  const { data: walletClient } = useWalletClient()
  const client = useRef(new ApiWrapper(host));
  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const proposalData = useAppSelector(state => state.propHouse);

  const getProposals = async ()=> {
    const proposals = await client.current.getAuctionProposals(round.id);
    dispatch(setActiveProposals(proposals));
  }

  if (!proposalData.activeProposals) {
    getProposals();
  }

  const editProposal = ()=> {
    dispatch(setProposalData({ title: proposal.title, tldr: proposal.tldr, description: proposal.what, id: proposal.auctionId, proposalId:proposal.id }));
    dispatch(updateProposal({ title: proposal.title, tldr: proposal.tldr, what: proposal.what, reqAmount: null}));

    navigate('/create',{ state: { auction:proposalData.activeRound, community:proposalData.activeCommunity, proposals:proposalData.activeProposals }});
    console.log(proposalData);
  }

  console.log('round from rednered fields:  ', round);

  return (
    <>
        <Col xl={12} className="proposalCopy">
          <div className={classes.headerContainer}>
            <div className={classes.backBtnContainer}>{backButton && backButton}</div>
            <div className={classes.headerBottomContainer}>
              <div>
                <h1 className={clsx('frontinusTitle')}>{fields.title}</h1>

                {proposal.address && proposal.id && (
                  <div className={classes.subinfo}>
                    <div className={classes.propBy}>
                      <span>{t('propCap')}</span>
                      {t('by')}
                      <div className={classes.submittedBy}>
                        <EthAddress address={proposal.address} className={classes.submittedBy} />
                      </div>
                      <span>{' • '} {formatServerDate(proposal.createdDate)}</span>
                      <span
                          onClick={editProposal}
                          className={classes.editBy}>{' • '}
                        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M10.184 1.63622C10.3435 1.44217 10.5389 1.28549 10.758 1.17608C10.9771 1.06667 11.2151 1.00691 11.457 1.00056C11.6988 0.994219 11.9393 1.04143 12.1631 1.13922C12.387 1.23701 12.5894 1.38324 12.7577 1.5687C12.9259 1.75416 13.0562 1.9748 13.1405 2.21671C13.2247 2.45861 13.261 2.71651 13.2471 2.97414C13.2332 3.23177 13.1693 3.48351 13.0596 3.71349C12.9498 3.94347 12.7966 4.14667 12.6095 4.31028L11.4125 5.58711L8.938 2.94665L10.1753 1.62688L10.184 1.63622ZM5.22538 12.1859V12.1878H2.75V9.5464L8.31938 3.60653L10.7939 6.24699L5.22538 12.1859ZM1 13.1333H15V15H1V13.1333Z" fill="#D0A059"/>
</svg> edit
                      </span>
                    </div>
                  </div>
                )}


              </div>
              {proposal.reqAmount && round && (
                <div className={classes.fundReq}>
                  <BiAward size={'1.8rem'} />
                  {`${proposal.reqAmount} ${round?.currencyType}`}
                </div>
              )}
            </div>
          </div>

          <div className={classes.proposalBody}>
            {fields.tldr && (
              <div className={classes.tldr}>
                <h2 >{t('tldr')}</h2>
                <ReactMarkdown className={`${classes.markdown} ${classes.tldrContent}`} children={fields.tldr}></ReactMarkdown>
              </div>
            )}

            <h2>{t('description')}</h2>
            <div
                className="ql-editor"
                dangerouslySetInnerHTML={{ __html: fields.what}}
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
        </Col>
    </>
  );
};

export default RenderedProposalFields;
