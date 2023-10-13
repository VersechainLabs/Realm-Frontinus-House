import classes from './HomeTitle.module.css';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

const HomeTitle = () => {
  const { t } = useTranslation();

  return (
    <div className={classes.title}>

        <>
          <h1 className={classes.fundedText}>
            Create your community
          </h1>
            <div className={classes.homeDesc}>
                Descriptive text about who we are and what we can doa, Descriptive text about who we are and what we can do.  Descriptive text about who we are and what we can do
            </div>
        </>
    </div>
  );
};

export default HomeTitle;
