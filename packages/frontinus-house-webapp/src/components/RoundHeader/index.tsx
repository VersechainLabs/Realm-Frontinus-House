import { Row, Col } from 'react-bootstrap';
import classes from './RoundHeader.module.css';
import { Community, StoredAuctionBase,ApproveRound } from '@nouns/frontinus-house-wrapper/dist/builders';

import clsx from 'clsx';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import formatTime from '../../utils/formatTime';
import { nameToSlug } from '../../utils/communitySlugs';
import Button, { ButtonColor } from '../Button';
import ReadMore from '../ReadMore';
import { ForceOpenInNewTab } from '../ForceOpenInNewTab';
import { isLongName } from '../../utils/isLongName';
import { isInfAuction } from '../../utils/auctionType';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useAppSelector } from '../../hooks';
import { useDispatch } from 'react-redux';
import { useWalletClient } from 'wagmi';
import { Link, useNavigate } from 'react-router-dom';
import { setAlert } from '../../state/slices/alert';
import dayjs from 'dayjs';
import {useEffect, useRef} from "react";

const RoundHeader: React.FC<{
  community: Community;
  auction: StoredAuctionBase;
}> = props => {
  const { community, auction } = props;
  const navigate = useNavigate();

  const md = (auction?.description as any).replace(/\n/g, "<br />");

  const roundDescription = (
    <>
      {/* support both markdown & html links in community's description.  */}
      <Markdown
        options={{
          overrides: {
            a: {
              component: ForceOpenInNewTab,
              props: {
                target: '_blank',
                rel: 'noreferrer',
              },
            },
          },
        }}
      >
        {sanitizeHtml(md, {
          allowedAttributes: {
            a: ['href', 'target'],
          },
        })}
      </Markdown>
    </>
  );
  //auction?.description as any
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));
  const { data: walletClient } = useWalletClient();
  const dispatch = useDispatch();
  const userType = useAppSelector(state => state.user.type);
  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  const approveRound = async (flag:number) => {
    await client.current.approveAuction(new ApproveRound(
        auction.id,
        flag
    )).then(()=> {
      if (flag === 1) {
        dispatch(setAlert({ type: 'success', message: 'Approve Successfully' }));
      } else {
        dispatch(setAlert({ type: 'success', message: 'Reject Successfully' }));
      }

      navigate('/');
    })
  }

  return (
    <Row className={classes.profileHeaderRow}>
      <Col>
        {auction && auction.hasOwnProperty('visibleStatus') && auction.visibleStatus == 0 && userType === 'Admin' && (<div className={classes.pendingMain}>
          <div className={classes.pendingTitle}>
            Pending Round
          </div>
          <Button
              text="Approve"
              bgColor={ButtonColor.Purple}
              onClick={() => approveRound(1)}
              classNames={classes.pendingButton}
          />
          <div className={classes.pendingReject}
               onClick={() => approveRound(2)}

          >
            Reject
          </div>
        </div>)}
        <div
          className={classes.backToAuction}
          onClick={() => {
            // community && navigate(`/${nameToSlug(community.name)}`);
            community && navigate(`/`);
          }}
        >
          {community && (
            <>
              <img
                src={community.profileImageUrl}
                alt="community profile"
                className={classes.profImg}
              />
              <div className={classes.commTitle}>{community.name}</div>
            </>
          )}
        </div>

        <Col lg={12} className={classes.communityInfoCol}>
          <div className={clsx('frontinusTitle',classes.date)}>
            {isInfAuction(auction)
              ? `${dayjs().isBefore(auction.startTime) ? `Starts` : `Started`} ${formatTime(
                  auction.startTime,
                )}`
              : `${formatTime(auction.startTime)} - ${formatTime(auction.proposalEndTime)}`}
          </div>
          <Col
            className={clsx(
              classes.titleRow,
              isLongName(community ? community.name : '') && classes.longName,
            )}
          >
            <div className={clsx('frontinusTitle',classes.title)}>{auction && `${auction.title}`}</div>
          </Col>

          <Col className={classes.communityDescriptionRow}>
            <ReadMore description={roundDescription} />
          </Col>
        </Col>
      </Col>
    </Row>
  );
};

export default RoundHeader;
