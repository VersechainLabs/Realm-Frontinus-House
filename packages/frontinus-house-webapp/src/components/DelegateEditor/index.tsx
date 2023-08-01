import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { useTranslation } from 'react-i18next';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import BlotFormatter from 'quill-blot-formatter';
import ImageUploadModal from '../ImageUploadModal';
import ProposalInputs from '../ProposalInputs';
import { useSigner } from 'wagmi';
import { useLocation } from 'react-router-dom';
import { isInfAuction } from '../../utils/auctionType';
import classes from './DelegateEditor.module.css';
import DelegatePreview from '../DelegatePreview';

export interface FormDataType {
  title: string;
  focus?: boolean;
  type: 'input';
  fieldValue: string;
  fieldName: string;
  placeholder: string;
  value: string;
  minCount: number;
  maxCount: number;
  error: string;
}

export interface FundReqDataType {
  isInfRound: boolean;
  title: string;
  roundCurrency: string;
  initReqAmount: number;
  remainingBal: number;
  error: string;
}

const DelegateEditor: React.FC<{
  fields?: ProposalFields;
  onDataChange: (data: Partial<ProposalFields>) => void;
  showImageUploadModal?: boolean;
  setShowImageUploadModal: Dispatch<SetStateAction<boolean>>;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  onFileDrop: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  invalidFileError: boolean;
  setInvalidFileError: Dispatch<SetStateAction<boolean>>;
  invalidFileMessage: string;
  setInvalidFileMessage: Dispatch<SetStateAction<string>>;
  duplicateFile: { error: boolean; name: string };
  setDuplicateFile: Dispatch<SetStateAction<{ error: boolean; name: string }>>;
  remainingBal?: number;

  // buttonText: string;
  // buttonColor: string;
  // onButtonClick: () => void;
  //
  // additionalButtonText: string;
  // additionalButtonColor: string;
  // additionalButtonOnClick: () => void;
}> = props => {
  const {
    fields,
    onDataChange,
    showImageUploadModal,
    setShowImageUploadModal,
    files,
    setFiles,
    invalidFileError,
    setInvalidFileError,
    invalidFileMessage,
    setInvalidFileMessage,
    duplicateFile,
    setDuplicateFile,
    onFileDrop,
    remainingBal,
    // buttonText,
    // buttonColor,
    // onButtonClick,
    // additionalButtonText,
    // additionalButtonColor,
    // additionalButtonOnClick,
  } = props;

  const [previewMode, setPreviewMode] = useState(false);
  const data = useAppSelector(state => state.editor.proposal);
  const [editorBlurred, setEditorBlurred] = useState(false);
  const { t } = useTranslation();
  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));

  const location = useLocation();
  const roundFromLoc = location.state && location.state.auction;
  const roundFromStore = useAppSelector(state => state.propHouse.activeRound);
  const isInfRound = isInfAuction(roundFromLoc ? roundFromLoc : roundFromStore);
  const roundCurrency = roundFromLoc
    ? roundFromLoc.currencyType
    : roundFromStore
    ? roundFromStore.currencyType
    : '';

  useEffect(() => {
    client.current = new ApiWrapper(host, signer);
  }, [signer, host]);

  const formData: FormDataType[] = [
    {
      title: t('title'),
      focus: true,
      type: 'input',
      fieldValue: data.title,
      fieldName: 'title',
      placeholder: t('delegateTitle'),
      value: '',
      minCount: 5,
      maxCount: 80,
      error: t('titleError'),
    },
    {
      title: t('tldr'),
      type: 'input',
      fieldValue: data.tldr,
      fieldName: 'tldr',
      placeholder: t('bibliothecaTitle'),
      value: '',
      minCount: 10,
      maxCount: 120,
      error: t('tldrError'),
    },
  ];

  const descriptionData = {
    title: t('description'),
    type: 'textarea',
    fieldValue: data.what,
    fieldName: 'what',
    placeholder: t('delegateDescription'),
    value: '',
    minCount: 50,
    error: t('descriptionError'),
  };

  const fundReqData: FundReqDataType = {
    isInfRound: isInfRound,
    title: 'Funds Request',
    roundCurrency: roundCurrency,
    initReqAmount: 0,
    remainingBal: remainingBal ? remainingBal : 0,
    error: `Exceeds remaining round balance of ${remainingBal} ${roundCurrency}`,
  };

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
    'image',
  ];

  const imageHandler = () => setShowImageUploadModal(true);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ list: 'ordered' }],
        ['link'],
        ['image'],
      ],
    },
    blotFormatter: {},
    clipboard: {
      matchVisual: false,
    },
  };
  const theme = 'snow';
  const placeholder = descriptionData.placeholder;

  const { quill, quillRef, Quill } = useQuill({
    theme,
    modules,
    formats,
    placeholder,
  });

  if (Quill && !quill) {
    Quill.register('modules/blotFormatter', BlotFormatter);
  }
  const handlePreviewClick = () => {
    setPreviewMode(!previewMode);
    // Navigate to the preview page when previewMode is true
    if (previewMode) {
      const newPath = '/preview';
      window.location.href = newPath;
    }
  };
  useEffect(() => {
    if (quill) {
      var toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);

      const input = document.querySelector('input[data-link]') as HTMLInputElement;
      input.dataset.link = 'https://prop.house';
      input.placeholder = 'https://prop.house';

      quill.root.innerHTML = data.what;

      quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
        setEditorBlurred(false);
        if (source === 'user') {
          const html = quill.root.innerHTML;
          onDataChange({ what: html });
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill]);

  useEffect(() => {
    if (fields) onDataChange(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={classes.nominateText}>Creating your proposal for</div>
      <ProposalInputs onDataChange={onDataChange} formData={formData} fundReqData={fundReqData} />

      <div className={classes.buttonContainer}>
        {/* <button
          type="button"
          className={`${classes.submitButton} customButton`}
          // style={{ backgroundColor: buttonColor }}
          // onClick={onButtonClick}
        >
          {'Submit'}
        </button> */}
        <button
          type="button"
          className={`${classes.additionalButton} customButton`}
          onClick={handlePreviewClick}
          // style={{ backgroundColor: additionalButtonColor }}
          // onClick={additionalButtonOnClick}
        >
          {previewMode ? 'Edit' : 'Preview'}
        </button>
      </div>
      {/* Render the DelegatePreview component if in previewMode */}
      {previewMode && <DelegatePreview data={data} />}
    </>
  );
};

export default DelegateEditor;
