import { Container, Row } from 'react-bootstrap';
import classes from './HomeHeaderV2.module.css';
import HomeTitleV2 from '../HomeTitleV2';
import HomeStatsV2 from '../HomeStatsV2';
import SearchBarV2 from '../SeachBarV2';
import { StatsProps } from '../../pages/Home';
import { useNavigate } from 'react-router-dom';
import { openInNewTab } from '../../utils/openInNewTab';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { useTranslation } from 'react-i18next';
import { Community } from '@nouns/frontinus-house-wrapper/dist/builders';

interface HomeHeaderProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats: StatsProps;
  communities: Community[];
}

const HomeHeaderV2 = ({ input, handleSeachInputChange, stats, communities }: HomeHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Row className={classes.wrapper}>
      <HomeTitleV2 />

      {/*<button*/}
      {/*  className={classes.learnMoreBtn}*/}
      {/*  onClick={e => {*/}
      {/*    if (cmdPlusClicked(e)) {*/}
      {/*      openInNewTab('/create-round-form');*/}
      {/*      return;*/}
      {/*    }*/}

      {/*    navigate('/create-round-form');*/}
      {/*  }}*/}
      {/*>*/}
      {/*  {t('createAProposalRound')}*/}
      {/*</button>*/}
      <HomeStatsV2 stats={stats} />

      <div className={classes.searchBarSection}>
        <Container className={classes.searchBarContainer}>
          <p className={classes.subtitle}>{communities.length} Communities</p>
          <SearchBarV2
            input={input}
            handleSeachInputChange={handleSeachInputChange}
            placeholder={t('searchCommunity')}
          />
        </Container>
      </div>
    </Row>
  );
};

export default HomeHeaderV2;
