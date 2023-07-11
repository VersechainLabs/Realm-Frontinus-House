import { Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import { useParams } from 'react-router-dom';
import CreateCommentWidget from '../../components/CreateCommentWidget';

const Comments = () => {
  const params = useParams();
  const { proposalId } = params;

  const [commentList, setCommentList] = useState<CommentModal[]>([]);

  const host = useAppSelector(state => state.configuration.backendHost);
  // const wrapper = useMemo(() => new PropHouseWrapper(host), [host]);
  const client = useRef(new PropHouseWrapper(host));
  useEffect(() => {
    const getCommentList = async () => {
      const commentListResponse = await client.current.getCommentList(Number(proposalId), 1);
      setCommentList(commentListResponse);
    };

    getCommentList();
  }, []);

  const onCommentCreated = (newComment: CommentModal) => {
    setCommentList(commentList.concat(newComment));
  };

  return (<>
    <Container>
      <div style={{ marginTop: 20 }}>
      </div>

      <CreateCommentWidget
        proposalId={Number(proposalId)}
        onCommentCreated={onCommentCreated}
      />

      {commentList.length > 0 &&
        <ListGroup>
          {commentList.map((comment) =>
            <CommentListItem comment={comment} />,
          )}
        </ListGroup>}
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
    <ListGroupItem key={`comment-${comment.id}`} variant='dark'>{comment.content}</ListGroupItem>
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
