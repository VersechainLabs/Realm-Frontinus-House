import React, { useEffect, useRef, useState } from 'react';
import { DeltaStatic, Quill } from 'quill';
import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import { useAppSelector } from '../../hooks';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { Comment, StoredComment } from '@nouns/frontinus-house-wrapper/dist/builders';
import { useAccount, useWalletClient } from 'wagmi';
import {setActiveCommunity} from "../../state/slices/propHouse";
type CreateCommentWidgetProps = {
  proposalId?: number;
  applicationId?: number;
  onCommentCreated: (comment: StoredComment) => void;
}

export default function CreateCommentWidget(props: CreateCommentWidgetProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [quill, setQuill] = useState<Quill | undefined>(undefined);

  const { address: account } = useAccount();
  const { data: walletClient } = useWalletClient();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host, walletClient));

  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);

  const handleChange = (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => {
    if (plainText.trim().length === 0) {
      if( !htmlContent ){
        setContent('');
      }else{
        setContent(JSON.stringify(deltaContent.ops));
      }
    } else {
      setContent(JSON.stringify(deltaContent.ops));
    }
  };

  const submit = async () => {
    try {
      if (content.length === 0 || !account) {
        return;
      }

      setLoading(true);

      const newComment = new Comment(content, props.proposalId, props.applicationId);
      const commentCreateResponse = await client.current.createComment(newComment);
      if (commentCreateResponse) {
        props.onCommentCreated(commentCreateResponse);
        if (quill) {
          quill.setContents(EMPTY_DELTA);
        }
      }

      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.log(e);
    }

  };

  return (<>
    <QuillEditor
      widgetKey={'Comment-' + props.proposalId}
      onChange={handleChange}
      title='Create Comment'
      loading={loading}
      minHeightStr={'100px'}
      onQuillInit={(q) => setQuill(q)}
      btnText='Submit'
      onButtonClick={submit}
      placeholderText='What are your thoughts?'
    />
    {/*{account ? (*/}
    {/*  <Button text={'submit'} bgColor={ButtonColor.Purple} onClick={submit} />*/}
    {/*) : (*/}
    {/*  <ConnectButton*/}
    {/*    classNames={classes.actionBtn}*/}
    {/*    color={ButtonColor.Pink}*/}
    {/*    text='submit'*/}
    {/*  />)*/}
    {/*}*/}

  </>);
}