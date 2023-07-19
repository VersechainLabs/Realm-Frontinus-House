import { Container } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import CreateCommentWidget from '../CreateCommentWidget';
import { Avatar, List, ListItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import QuillViewer from '../QuillViewer';
import EthAddress from '../EthAddress';
import AddressAvatar from '../AddressAvatar';
import { serverDateToString } from '../../utils/detailedTime';
import classes from './Comments.module.css';

type CommentsProps = {
  proposalId: number;
}

export default function Comments(props: CommentsProps) {
  const { proposalId } = props;

  const [commentList, setCommentList] = useState<CommentModal[]>([]);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const [showTailLoading, setShowTailLoading] = useState(false);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));


  useEffect(() => {
    loadNextPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNextPage = (skip: number) => {
    if (showTailLoading || showFullLoading) {
      return;
    }

    if (skip === 0) {
      setShowFullLoading(true);
    } else {
      setShowTailLoading(true);
    }

    client.current.getCommentList(Number(proposalId), skip).then(
      async (res) => {
        let list;
        if (skip === 0) {
          list = res;
        } else {
          list = commentList.concat(res);
        }

        setCommentList(list);
      },
    ).finally(() => {
      setShowFullLoading(false);
      setShowTailLoading(false);
    });
  };

  const onCommentCreated = (newComment: CommentModal) => {
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
          {showTailLoading ? 'Loading...' : 'Load More'}
        </LoadingButton>
      </ListItem>,
    );
  }

  return (<>
    <Container>
      <div style={{ marginTop: 20 }}>
      </div>

      <CreateCommentWidget
        proposalId={Number(proposalId)}
        onCommentCreated={onCommentCreated}
      />

      <div>
        <div className={classes.listTitle}>Comments</div>

      </div>

      <List>{itemList}</List>

    </Container>
  </>);
};

/// CommentListItem

type CommentListItemProps = {
  comment: CommentModal;
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
          <QuillViewer content={props.comment.content}/>
        </div>

      </div>

    </ListItem>
  );
}

// CommentModal

export type CommentModal = {
  id: number;
  proposalId: number;
  content: string;
  visible: boolean;
  owner: string;
  createdDate: string;
}

