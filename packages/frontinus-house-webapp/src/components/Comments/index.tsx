import { Container } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useAppSelector } from '../../hooks';
import CreateCommentWidget from '../CreateCommentWidget';
import { Avatar, List, ListItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import QuillViewer from '../QuillViewer';
import EthAddress from '../EthAddress';
import AddressAvatar from '../AddressAvatar';
import { formatServerDate } from '../../utils/commentTime';
import classes from './Comments.module.css';
import LoadingIndicator from '../LoadingIndicator';
import { StoredComment } from '@nouns/frontinus-house-wrapper/dist/builders';
import clsx from "clsx";

type CommentsProps = {
  proposalId?: number;
  applicationId?: number;
  commentCount?:number;
  bipId?:number;
}

export default function Comments(props: CommentsProps) {
  const { proposalId, applicationId,commentCount ,bipId} = props;

  const [commentList, setCommentList] = useState<StoredComment[]>([]);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const [showTailLoading, setShowTailLoading] = useState(false);
  const [replyCount, setReplyCount] = useState(0);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    loadNextPage(0);
    setReplyCount(Number(commentCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, applicationId,commentCount]);

  const loadNextPage = (skip: number) => {

    if (showTailLoading || showFullLoading) {
      return;
    }

    if (skip === 0) {
      setShowFullLoading(true);
    } else {
      setShowTailLoading(true);
    }

    let getCommentPromise;
    if (proposalId) {
      getCommentPromise = client.current.getCommentListByProposal(Number(proposalId), skip);
    } else if (applicationId) {
      getCommentPromise = client.current.getCommentListByApplication(Number(applicationId), skip);
    } else if(bipId){
      getCommentPromise = client.current.getCommentListByBIP(Number(bipId), skip);
    }
    getCommentPromise.then(
      async (res) => {
        let list;
        if (skip === 0) {
          list = res;
        } else {
          list = commentList.concat(res);
        }
      console.log(res);
        if (res.length < 10) {
          setShowLoadMore(false);
        }

        if( commentCount == 10 && skip == 0 ) {
          setShowLoadMore(false);
        }
        setCommentList(list);
      },
    ).finally(() => {
      setShowFullLoading(false);
      setShowTailLoading(false);
      setLoading(false);
    });
  };

  const onCommentCreated = (newComment: StoredComment) => {
    setCommentList([newComment].concat(commentList));
    if ( newComment ){
      setReplyCount(replyCount+1);
    }
  };

  const itemList = [] as JSX.Element[];
  if (commentList.length === 0) {
    itemList.push(
      <ListItem key={'no-data'}>No comment yet</ListItem>,
    );
  } else {
    commentList.forEach((comment) => {
      itemList.push(CommentListItem({ comment: comment }));
    });

    if (showLoadMore) {
      itemList.push(
        <ListItem key={'has-more'} sx={{ justifyContent: 'center' }}>
          <LoadingButton
            loading={showTailLoading}
            onClick={() => loadNextPage(commentList.length)}
            className={classes.loadMoreBtn}
            sx={{
              textTransform: 'none',
            }}
          >
            {showTailLoading ? <LoadingIndicator /> : 'Load More'}
          </LoadingButton>
        </ListItem>,
      );
    }
  }

  return (<>
    <Container>
      <div style={{ marginTop: 20 }}>
      </div>

      {
        proposalId ? <CreateCommentWidget
          proposalId={Number(proposalId)}
          onCommentCreated={onCommentCreated}
        /> :(
            applicationId ? (
                <CreateCommentWidget
                    applicationId={Number(applicationId)}
                    onCommentCreated={onCommentCreated}
                />
            ):(
                <CreateCommentWidget
                    bipRoundId={Number(bipId)}
                    onCommentCreated={onCommentCreated}
                />
            )
        )
      }

      {/*<div className={classes.listBar}>*/}
      {/*  <div className={clsx('frontinusTitle',classes.listTitle)}>Comments {replyCount}</div>*/}
      {/*  /!*<div className={classes.listFilter}>Sort By : {filter}</div>*!/*/}
      {/*</div>*/}


      {loading ? (
          <LoadingIndicator />
      ) : (
         <>
           <div className={classes.listBar}>
             <div className={clsx('frontinusTitle',classes.listTitle)}>Comments {replyCount}</div>
           </div>
           <List>{itemList}</List>
         </>
      )}

    </Container>
  </>);
};

/// CommentListItem

type CommentListItemProps = {
  comment: StoredComment;
};

export function CommentListItem(props: CommentListItemProps) {
  const { comment } = props;
  const avatarSize = 40;

  return (
    <ListItem key={`comment-${comment.id}`} alignItems='flex-start' className={classes.listItem}>
      <Avatar sx={{
        width: avatarSize, height: avatarSize,
        marginRight: '16px',
      }}><AddressAvatar size={avatarSize} address={comment.address} /></Avatar>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        marginBottom: '10px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          marginBottom: '8px',
          marginTop:'-2px'
        }}>
          <EthAddress address={props.comment.address} className={'commentName'} />

          <div className={classes.date}>{' • '}  {formatServerDate(comment.createdDate)}
          </div>
        </div>
        <div className={classes.quillContent}>
          <QuillViewer content={props.comment.content} />
        </div>

      </div>

    </ListItem>
  );
}

