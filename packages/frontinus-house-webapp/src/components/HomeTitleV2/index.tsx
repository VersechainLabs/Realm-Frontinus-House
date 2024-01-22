import classes from './HomeTitleV2.module.css';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const HomeTitleV2 = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.title}>
      {
        <>
          {/* <h1 className={classes.fundedText}>
            <span>{t('getFunded')}</span>
            <div className={classes.build}>
              <span>{t('build')}</span>
              <img src="/line.svg" alt="line" />
            </div>
            <span>{t('with')}</span>
          </h1> */}
          <h1>{t('createYourCommunity')}</h1>
          <h5>{t('descriptionForHomeV2')}</h5>
        </>
      }
    </div>
  );
};

export default HomeTitleV2;
