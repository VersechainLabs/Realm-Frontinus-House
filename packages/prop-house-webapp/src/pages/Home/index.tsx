import HomeHeader from '../../components/HomeHeader';
import classes from './Home.module.css';
import { Container } from 'react-bootstrap';
import CommunityCardGrid from '../../components/CommunityCardGrid';
import { useEffect, useState, useRef } from 'react';
import { Community } from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAppSelector } from '../../hooks';
import NavBar from '../../components/NavBar';
import { useSigner } from 'wagmi';

export interface StatsProps {
  accEthFunded: number;
  accRounds: number;
  accProps: number;
}

const Home = () => {
  const [input, setInput] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<StatsProps>({
    accEthFunded: 0,
    accRounds: 0,
    accProps: 0,
  });

  const handleSeachInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      setIsLoading(true);
      const communities = await client.current.getCommunities();

      setCommunities(communities.sort((a, b) => (a.numProposals < b.numProposals ? 1 : -1)));

      const accEthFunded = communities.reduce((prev, current) => prev + current.ethFunded, 0);
      const accRounds = communities.reduce((prev, current) => prev + current.numAuctions, 0);
      const accProps = communities.reduce((prev, current) => prev + current.numProposals, 0);
      setStats({
        accEthFunded,
        accRounds,
        accProps,
      });

      setIsLoading(false);
    };
    getCommunities();
  }, []);

  return (
    <>
      <div className="homeGradientBg">
        <NavBar />
        <HomeHeader input={input} handleSeachInputChange={handleSeachInputChange} stats={stats} />
      </div>

      <Container className={classes.homeCardsContainer}>
        <CommunityCardGrid input={input} communities={communities} isLoading={isLoading} />
      </Container>
    </>
  );
};

export default Home;
