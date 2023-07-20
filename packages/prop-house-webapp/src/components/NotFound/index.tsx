import classes from './NotFound.module.css';
// import hardhatNoun from '../../assets/hardhat-noun.png';

const NotFound = () => {
  return (
    <div className={classes.invalidAddressCard}>
      <img
        src="https://cdn.metaforo.io/upload/20230706/d08103b6fcf9bb97b4db83e4ee43f221.jpg"
        alt="invalid address noun"
        className={classes.invalidAddressNoun}
      />
      <div className={classes.textContainer}>
        <h1>Invalid URL</h1>
        <p>
          Please check that the url follows the format:
          <br />
          <code>proposal/:proposal_id</code>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
