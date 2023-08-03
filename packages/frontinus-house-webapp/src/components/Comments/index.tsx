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
import { serverDateToString } from '../../utils/detailedTime';
import classes from './Comments.module.css';
import LoadingIndicator from '../LoadingIndicator';
import { StoredComment } from '@nouns/frontinus-house-wrapper/dist/builders';

type CommentsProps = {
  proposalId?: number;
  applicationId?: number;
}

export default function Comments(props: CommentsProps) {
  const { proposalId, applicationId } = props;

  const [commentList, setCommentList] = useState<StoredComment[]>([]);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const [showTailLoading, setShowTailLoading] = useState(false);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNextPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalId, applicationId]);

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
    } else {
      getCommentPromise = client.current.getCommentListByApplication(Number(applicationId), skip);
    }
    getCommentPromise.then(
      async (res) => {
        let list;
        if (skip === 0) {
          list = res;
        } else {
          list = commentList.concat(res);
        }

        if (list.length <= 0) {
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
  };

  const itemList = [] as JSX.Element[];
  if (commentList.length === 0) {
    itemList.push(
      <ListItem>No comment yet</ListItem>,
    );
  } else {
    commentList.forEach((comment) => {
      itemList.push(CommentListItem({ comment: comment }));
    });

    if (commentList.length % 10 === 0) {
      itemList.push(
        <ListItem key={'has-more'} sx={{ justifyContent: 'center' }}>
          <LoadingButton
            loading={showTailLoading}
            onClick={() => loadNextPage(commentList.length)}
            sx={{
              display: 'flex',
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
        /> : <CreateCommentWidget
          applicationId={Number(applicationId)}
          onCommentCreated={onCommentCreated}
        />
      }

      <div className={classes.listBar}>
        <div className={classes.listTitle}>Comments</div>
        {/*<div className={classes.listFilter}>Sort By : {filter}</div>*/}
      </div>
      {!loading ? <List>{itemList}</List> : (
        <LoadingIndicator />
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
      }}><AddressAvatar size={avatarSize} address={comment.owner} /></Avatar>
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
        }}>
          <EthAddress address={props.comment.owner} />

          <div className={classes.date}>
            <span style={{
              marginRight: '6px',
            }}>{' • '} </span> {serverDateToString(comment.createdDate)}
          </div>
        </div>
        <div className={classes.quillContent}>
          <QuillViewer content={props.comment.content} />
        </div>

      </div>

    </ListItem>
  );
}

