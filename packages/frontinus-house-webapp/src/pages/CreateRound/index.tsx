import classes from './CreateRound.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../components/Card';
import Button, { ButtonColor } from '../../components/Button';
import { Link, useNavigate } from 'react-router-dom';

const CreateRound: React.FC<{}> = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Row>
        <Col md={{ span: 8, offset: 2 }} className={classes.container}>
          <h1>Creating a round</h1>

          <div className={classes.step}>
            <h2>Fill out the form</h2>
            <p>
              Simply fill out our form with some basic information about your round. You’ll need to
              know the basics like the round timing, award amount, round and house name. Once filled
              out, you can expect your round to go live within 24 hours (usually much less).
            </p>
            <Button
              text="Create timed round"
              bgColor={ButtonColor.Purple}
              onClick={() => navigate('/create-round-form')}
            />
            <Button
              text="Create delegate"
              bgColor={ButtonColor.Purple}
              onClick={() => navigate('/create-delegate-form')}
            />
          </div>
          <div className={classes.step}>
            <h2>Questions?</h2>
            <p>
              If you're not sure what to do, or have any questions, please reach out to us via our
              <a href="https://discord.gg/uQnjZhZPfu" target="_blank" rel="noreferrer">
                {' '}
                Discord server
              </a>
              .
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default CreateRound;
