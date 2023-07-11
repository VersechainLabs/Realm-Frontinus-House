import { Container, ListGroup, ListGroupItem } from 'react-bootstrap';
import React, { useEffect, useRef, useState } from 'react';
import Button, { ButtonColor } from '../../components/Button';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import QuillEditor from '../../components/QuillEditor';
import { DeltaStatic } from 'quill';
import { useParams } from 'react-router-dom';

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

  return (<>
    <Container>
      <Button text='Test Button'
              onClick={() => {
              }}
              bgColor={ButtonColor.Purple}
      />

      <div style={{ marginTop: 50 }}>
        {/*<CreateCommentWidget proposalId={1} />*/}
      </div>

      <CreateCommentWidget proposalId={Number(proposalId)} />

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
  createdData: string;
}

// CreateCommentModal
type CreateCommentWidgetProps = {
  proposalId: number;
}

export function CreateCommentWidget(props: CreateCommentWidgetProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      setContent('');
    } else {
      setContent(JSON.stringify(deltaContent.ops));
    }
  };

  const submit = () => {
    console.log(content);
    setLoading(!loading);
  };

  return (<>
    <QuillEditor
      widgetKey={'Comment-' + props.proposalId}
      onChange={handleChange}
      title='Create Comment'
      loading={loading}
    />
    <Button text={'submit'} bgColor={ButtonColor.Purple} onClick={submit} />
  </>);
}