import React, { useRef, useState } from 'react';
import { DeltaStatic, Quill } from 'quill';
import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import Button, { ButtonColor } from '../Button';
import { CommentModal } from '../../pages/Comments';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

type CreateCommentWidgetProps = {
  proposalId: number;
  onCommentCreated: (comment: CommentModal) => void;
}

export default function CreateCommentWidget(props: CreateCommentWidgetProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quill, setQuill] = useState<Quill | undefined>(undefined);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      setContent('');
    } else {
      setContent(JSON.stringify(deltaContent.ops));
    }
  };

  const submit = async () => {
    console.log(content);
    setLoading(true);

    const commentCreateResponse = await client.current.createComment(props.proposalId, content, '0x7A6D4928e935b8343787a2C932c8D7a14Eed3eD1');
    props.onCommentCreated(commentCreateResponse);

    setLoading(false);

    if (quill) {
      quill.setContents(EMPTY_DELTA);
    }
  };

  return (<>
    <QuillEditor
      widgetKey={'Comment-' + props.proposalId}
      onChange={handleChange}
      title='Create Comment'
      loading={loading}
      onQuillInit={(q) => setQuill(q)}
    />
    <Button text={'submit'} bgColor={ButtonColor.Purple} onClick={submit} />
  </>);
}