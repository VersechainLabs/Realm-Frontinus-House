import React, { useEffect, useRef, useState } from 'react';
import { DeltaStatic, Quill } from 'quill';
import QuillEditor, { EMPTY_DELTA } from '../QuillEditor';
import { useAppSelector } from '../../hooks';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { Comment, StoredComment } from '@nouns/frontinus-house-wrapper/dist/builders';
import { useAccount, useWalletClient } from 'wagmi';
import {setActiveCommunity} from "../../state/slices/propHouse";
import {setAlert} from "../../state/slices/alert";
import {useDispatch} from "react-redux";
type CreateCommentWidgetProps = {
  proposalId?: number;
  applicationId?: number;
  bipRoundId?:number;
  onCommentCreated: (comment: StoredComment) => void;
}

const handleImgArrayChange = (img : string) => {
  return false;
};
export default function CreateCommentWidget(props: CreateCommentWidgetProps) {
  const dispatch = useDispatch();

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

      const newComment = new Comment(content, props.proposalId, props.applicationId,props.bipRoundId);
      const commentCreateResponse = await client.current.createComment(newComment);
      if (commentCreateResponse) {
        props.onCommentCreated(commentCreateResponse);
        if (quill) {
          quill.setContents(EMPTY_DELTA);
        }
      }

      setLoading(false);
    } catch (e) {
      if ( typeof(e) == 'string' ){
        dispatch(
            setAlert({
              type: 'error',
              message: e,
            }),
        );
      }
      setLoading(false);
      // dispatch(setAlert({ type: 'error', message: e }));
    }

  };

  return (<>
    <QuillEditor
      widgetKey={'Comment-' + props.proposalId}
      onChange={handleChange}
      imgArrayChange={handleImgArrayChange}
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