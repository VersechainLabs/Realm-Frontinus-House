import { Container } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import { useParams } from 'react-router-dom';
import CreateCommentWidget from '../../components/CreateCommentWidget';
import { List, ListItem } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import QuillViewer from '../../components/QuillViewer';
import EthAddress from '../../components/EthAddress';
import { useAccount } from 'wagmi';

const Comments = () => {
  const params = useParams();
  const { proposalId } = params;

  const [commentList, setCommentList] = useState<CommentModal[]>([]);
  const [showFullLoading, setShowFullLoading] = useState(false);
  const [showTailLoading, setShowTailLoading] = useState(false);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));


  useEffect(() => {
    loadNextPage(0);
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

  return (<>
    <Container>
      <div style={{ marginTop: 20 }}>
      </div>

      <CreateCommentWidget
        proposalId={Number(proposalId)}
        onCommentCreated={onCommentCreated}
      />

      <List>{itemList}</List>

    </Container>
  </>);
};

export default Comments;

/// CommentListItem

type CommentListItemProps = {
  comment: CommentModal;
};

export function CommentListItem(props: CommentListItemProps) {
  const { comment } = props;

  return (
    <ListItem key={`comment-${comment.id}`}>
      {/*<Jazzicon diameter={20} seed={jsNumberForAddress(props.comment.owner)} />*/}
      <div>
        <EthAddress address={props.comment.owner} addAvatar />
      </div>
      <QuillViewer content={props.comment.content} />
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
