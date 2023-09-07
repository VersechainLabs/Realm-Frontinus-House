import classes from './BIPPreview.module.css';
import 'react-quill/dist/quill.snow.css';
import '../../quill.css';
import React, { useEffect, useRef, useState } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import clsx from 'clsx';


const BIPPreview: React.FC<{
    onClickGoBack: () => void;
    title: string | undefined;
    description: string | undefined;
}> = props => {

    const { onClickGoBack, title, description } = props;
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);

    const handleGoBack = () => {
        props.onClickGoBack();
    };

    useEffect(() => {

    });


    return (
        <div className={classes.previewCard}>
            <div className={classes.title}>
                <div
                    className={'frontinusTitle'}
                    style={{
                        marginBottom: '1rem',
                    }}
                >
                    Creating Your Proposal
                </div>
            </div>
            <div className={classes.previewTitle}>
                <div
                    className={'frontinusTitle'}
                    style={{
                        fontSize: '24px',
                        fontWeight: '700',
                    }}
                    dangerouslySetInnerHTML={{ __html: title }}
                />
            </div>
            <div className={classes.previewDesc}>
                <div
                    className={'frontinusTitle'}
                    style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        marginTop: '1.5rem',
                    }}
                >
                    {' '}
                    Description{' '}
                </div>
                <div
                    className={clsx(classes.descContent, 'ql-editor')}
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            </div>
            <div
                className={classes.btnContainer}
                style={{
                    marginTop: '3.5rem',
                }}
            >
                {/* </div> */}
                <button
                    className={classes.goBackButton}
                    onClick={handleGoBack}
                    disabled={isButtonDisabled}
                    style={{
                        backgroundColor: '#111111',
                        border: '1px solid #111111',
                        color: '#a6a9ab',
                        width: '150px',
                        height: '28px',
                        fontWeight: '700',
                    }}
                >
                    Back to editor
                </button>
            </div>

        </div>
    );
};

export default BIPPreview;
