import { DeltaStatic, Quill } from 'quill';
import React, {useEffect, useRef, useState} from 'react';
import './quill.snow.css';
import { useQuill } from 'react-quilljs';
import BlotFormatter from 'quill-blot-formatter';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';
import classes from './QuillEditor.module.css';
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useAccount} from "wagmi";

type QuillEditorProps = {
  widgetKey: string;
  onChange: (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => void;
  title: string | undefined;
  loading: boolean;
  minHeightStr:string

  // 用于在上层操作 quill 的内容，通常是提交之后将 quill 的内容清空时使用
  onQuillInit?: (quill: Quill) => void;
  onButtonClick?: (widgetKey: string) => void;
  btnText:string | 'Submit';
  placeholderText:string;
}

export default function QuillEditor(props: QuillEditorProps) {

  const formats = [
      'size',
      'italic',
      'header',
      'bold',
      'underline',
      'strike',
      'blockquote',
      'code-block',
      'list',
      'bullet',
      'link',
      'align',
      'image'
  ];

  const { address: account } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [showLoading, setShowLoading] = useState(false);



  const imageHandler = async () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      let data = null;
      const formData = new FormData();
      const quillObj = quillRef.current.__quill;
      const range = quillObj?.getSelection();

      // console.log(file);
      // console.log(quillRef);
      // console.log(range);


      if (file) {

        setShowLoading(true);
        quillObj.disable();

        formData.append('file', file);
        formData.append('name', file.name);

        const responseUpload = await fetch(
            `${process.env.REACT_APP_DEV_BACKEND_URI}/file`,
            { method: 'POST', body: formData }
        );

        data = await responseUpload.json();
        if (data.error) {
          alert(data.error);
          return;
        }

        setShowLoading(false);
        quillObj.enable();

        quillObj.editor.insertEmbed(range.index, 'image', 'https://ipfs.io/ipfs/'+data.ipfsHash,'user');
        quillObj.setSelection(range.index + 1)
      }
    };
  };

  const modules = {
    // toolbar: {
    //   container: [
    //     [{ header: [1, 2, false] }],
    //     ['bold', 'underline', 'strike', 'blockquote', 'code-block'],
    //     [{ list: 'ordered' }],
    //     ['link'],
    //   ],
    // },
    // toolbar: "#toolbar",
    toolbar: {
      container:'#toolbar',
      handlers: {
        image: imageHandler
      }
    },
    blotFormatter: {},
    clipboard: {
      matchVisual: false,
    },
  };



  const theme = 'snow';
  const placeholder = props.placeholderText;


  const { quill, quillRef, Quill } = useQuill({ theme, modules,placeholder,formats});
  if (Quill && !quill) {
    Quill.register('modules/blotFormatter', BlotFormatter);
    // Quill.register('modules/placeholder', getPlaceholderModule(Quill, {
    //   className: 'ql-placeholder-content'  // default
    // }))
  }

  useEffect(() => {
    if (!quill) {
      return;
    }

    if (props.onQuillInit) {
      props.onQuillInit(quill);
    }

    // quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
    //   if (source === 'user') {
    //     props.onChange(quill!.getContents(), quill!.root.innerHTML, quill.getText());
    //   }
    // });

    quill.on('selection-change', (delta: any, oldDelta: any, source: any) => {
      if (source === 'user') {
        props.onChange(quill!.getContents(), quill!.root.innerHTML, quill.getText());
      }
    });



    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill]);

  useEffect(() => {
    if (!quill) {
      return;
    }

    if (props.loading) {
      quill.disable();
    } else {
      quill.enable();
    }
  }, [props.loading, quill]);


  const clickBtn =  () => {
    if( showLoading ){
      return false;
    }
    return     props.onButtonClick?.(props.widgetKey);
  }


  const handleClick =  () => {
    const quillObj = quillRef.current.__quill;
    quillObj.focus();
  }


  return (
    <Form>
      <Form.Group className={clsx(classes.inputGroup)}>
        <div className={classes.inputSection}>
          {/*<div className={classes.inputInfo}>*/}
          {/*  {props.title && <Form.Label className={classes.inputLabel}>{props.title}</Form.Label>}*/}
          {/*  <Form.Label className={classes.iwnputChars}>{quill && quill.getText().length - 1}</Form.Label>*/}
          {/*</div>*/}
          <>
            <div  style={{minHeight:(props.minHeightStr)}} ref={quillRef} onClick={() => handleClick()}/>
            {
              showLoading && (
                  <div className={'loadingImg'}>
                    <div><img src="/loading.gif" alt=""/></div>
                  </div>
              )
            }
            <div id="toolbar">

              <select className="ql-size">
                <option ></option>
                <option value="large"></option>
                <option value="huge"></option>
              </select>


              <button className="ql-bold"></button>
              <button className="ql-italic"></button>

              <button className="ql-underline"></button>
              <button className="ql-list" value="ordered"></button>
              <button className="ql-list" value="bullet"></button>
              {/*<button className="ql-indent" value="-1"></button>*/}
              {/*<button className="ql-indent" value="+1"></button>*/}

              <button className="ql-align" value="center"></button>
              <button className="ql-align" value="right"></button>
              <button className="ql-align" value="justify"></button>

              <button className="ql-link"></button>

              <button className="ql-image"></button>

              <div
                  id="custom-button"
                  onClick={clickBtn}
              >
                <span>{ props.btnText }</span>
              </div>



            </div>
          </>
        </div>
      </Form.Group>
    </Form>
  );
}

export const EMPTY_DELTA = { ops: [] } as unknown as DeltaStatic;
