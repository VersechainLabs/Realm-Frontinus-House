import { DeltaStatic } from 'quill';
import React, { useEffect } from 'react';
import './quill.snow.css';
import { useQuill } from 'react-quilljs';
import BlotFormatter from 'quill-blot-formatter';
import { Form } from 'react-bootstrap';
import clsx from 'clsx';
import classes from './QuillEditor.module.css';

type QuillEditorProps = {
  widgetKey: string;
  onChange: (deltaContent: DeltaStatic, htmlContent: string, plainText: string) => void;
  title: string | undefined;
  loading: boolean;
}

export default function QuillEditor(props: QuillEditorProps) {

  const formats = [
    'header',
    'bold',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'link',
  ];


  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ list: 'ordered' }],
        ['link'],
      ],
    },
    blotFormatter: {},
    clipboard: {
      matchVisual: false,
    },
  };
  const theme = 'snow';

  const { quill, quillRef, Quill } = useQuill({ theme, modules, formats });
  if (Quill && !quill) {
    Quill.register('modules/blotFormatter', BlotFormatter);
  }

  useEffect(() => {
    if (!quill) {
      return;
    }

    quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
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

  return (
    <Form>
      <Form.Group className={clsx(classes.inputGroup)}>
        <div className={classes.inputSection}>
          <div className={classes.inputInfo}>
            {props.title && <Form.Label className={classes.inputLabel}>{props.title}</Form.Label>}
            <Form.Label className={classes.iwnputChars}>{quill && quill.getText().length - 1}</Form.Label>
          </div>
          <>
            <div ref={quillRef} />
          </>
        </div>
      </Form.Group>
    </Form>
  );
}