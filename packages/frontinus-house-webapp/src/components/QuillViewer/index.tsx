import { DeltaStatic } from 'quill';
import ReactQuill from 'react-quill';
import './QuillViewer.module.css';

type QuillViewerProps = {
  content: string;
}
export default function QuillViewer(props: QuillViewerProps) {
  let delta: DeltaStatic;
  try {
    delta = { ops: JSON.parse(props.content) } as DeltaStatic;
  } catch (e) {
    delta = [{ 'insert': props.content }] as unknown as DeltaStatic;
  }
  return <ReactQuill className={'quill-viewer'} value={delta} readOnly={true} modules={modules} />;
}

const modules = {
  blotFormatter: {},
  clipboard: {
    matchVisual: false,
  },
  toolbar: false,
};