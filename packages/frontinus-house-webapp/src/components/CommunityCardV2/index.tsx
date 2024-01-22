import classes from './CommunityCardV2.module.css';
import { Community } from '@nouns/frontinus-house-wrapper/dist/builders';
import CommunityProfImg from '../CommunityProfImg';
import { useTranslation } from 'react-i18next';
import TruncateThousands from '../TruncateThousands';
import getHouseCurrency from '../../utils/getHouseCurrency';

const CommunityCardV2: React.FC<{
  community: Community;
}> = props => {
  const { community } = props;
  const { t } = useTranslation();

  const houseCurrency = getHouseCurrency(community.contractAddress);

  const truncateName = (str: string) => {
    return str.length > 18 ? str.substring(0, 15) + '...' : str;
  };

  return (
    <div className={classes.container}>
      <CommunityProfImg community={community} />
      {/* <div className={classes.title}>{community.name}</div> */}
      <div className={classes.title}>{truncateName(community.name)}</div>
      <div className={classes.infoContainer}>
        {/* <hr className={classes.divider} /> */}
        <div className={classes.cardInfo}>
          <div className={classes.infoWithSymbol}>
            <div className={classes.infoText}>
              <span className={classes.infoAmount}>
                <TruncateThousands
                  amount={houseCurrency === 'Ξ' ? community.ethFunded : community.totalFunded}
                />{' '}
                {/* {houseCurrency} */}
              </span>{' '}
              <span className={classes.infoCopy}>{t('fundedCap')}</span>
            </div>
          </div>
          <div className={classes.infoText}>
            <span className={classes.infoAmount}>{community.numAuctions}</span>{' '}
            <span className={classes.infoCopy}>
              {community.numAuctions === 1 ? t('roundCap') : t('roundsCap')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCardV2;
