import Helmet from 'react-helmet';

const OpenGraphElements: React.FC<{
  title: string;
  description: string;
  imageUrl: string;
}> = props => {
  // const { title, description, imageUrl } = props;

  const title = 'Frontinus2 House';
  const description = 'Frontinus2 House - the proposal platform for Bibliotheca DAO, terraforming Realms.World';
  const imageUrl = 'https://ipfs.io/ipfs/QmbHh35XbjUThNTv3MCzU8rnzekZPvwuTC4BhgTXYkWrEK';

  return (
    <Helmet>
      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:url" content={'https://test-long.metaforo.io/'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* <!-- Twitter --> */}
      <meta property="twitter:url" content={'https://test-long.metaforo.io/'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:src" content={imageUrl} />
    </Helmet>
  );
};
export default OpenGraphElements;
