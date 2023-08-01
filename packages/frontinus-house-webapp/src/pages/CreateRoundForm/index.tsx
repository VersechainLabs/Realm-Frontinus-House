import classes from './CreateRoundForm.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useSigner } from 'wagmi';
import { nameToSlug } from '../../utils/communitySlugs';
import { TimedAuction } from '@nouns/frontinus-house-wrapper/dist/builders';
import { Link, useNavigate } from 'react-router-dom';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import Popup from '../../components/Popup';
import dayjs, { Dayjs } from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import { useDispatch, useSelector } from 'react-redux';
import { setAlert } from '../../state/slices/alert';

dayjs.extend(isToday);

const CreateRound: React.FC<{}> = () => {
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new ApiWrapper(host));
  const { data: signer } = useSigner();
  useEffect(() => {
    client.current = new ApiWrapper(host, signer);
  }, [signer, host]);
  const navigate = useNavigate();
  const currentTime = dayjs();
  const minDateTime = dayjs().subtract(1, 'minute');
  // 初始化表单中的时间字段为当前时间
  const [proposingStartTime, setProposingStartTime] = useState<Dayjs | null>(currentTime);
  const [proposalEndTime, setProposalEndTime] = useState<Dayjs | null>(currentTime);
  const [votingEndTime, setVotingEndTime] = useState<Dayjs | null>(currentTime);

  const MAX_TITLE_LENGTH = 50;
  const MAX_DESCRIPTION_LENGTH = 300;
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const dispatch = useDispatch();

  const [state, setState] = useState({
    description: '',
    title: '',
    startTime: new Date(),
    proposalEndTime: new Date(),
    votingEndTime: new Date(),
    numWinners: 0,
    currencyType: '',
    fundingAmount: 0,
    visible: true,
    community: 1,
    communityId: 1,
    balanceBlockTag: 0,
  });
  const [flag, setFlag] = useState(false);

  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const [showOrderWarning, setShowOrderWarning] = useState(false);
  const [showBlankWarning, setShowBlankWarning] = useState(false);

  const [isStartTimeFilled, setIsStartTimeFilled] = useState(false);
  const [isProposalTimeFilled, setIsProposalTimeFilled] = useState(false);
  const [isEndTimeFilled, setIsEndTimeFilled] = useState(false);

  const [isAlertVisible, setIsAlertVisible] = useState(false);

  const openPopup: { flag: boolean } = {
    flag: false,
  };

  const saveFormTitle = (value: string) => {
    const limitedTitle = value.slice(0, MAX_TITLE_LENGTH);
    setState(prevState => ({ ...prevState, title: limitedTitle }));
    setTitleLength(limitedTitle.length); // Update the titleLength state with the current input length
  };

  const saveFormDesc = (value: string) => {
    const limitedDescription = value.slice(0, MAX_DESCRIPTION_LENGTH);
    setState(prevState => ({ ...prevState, description: limitedDescription }));
    setDescriptionLength(limitedDescription.length); // Update the descriptionLength state with the current input length
  };

  const saveFormStart = (value: Dayjs | null) => {
    if (value !== null) {
      setState(prevState => ({
        ...prevState,
        startTime: value.toDate(),
      }));
      setProposingStartTime(value);
      setIsStartTimeFilled(true);
    }
  };

  const saveFormProposal = (value: Dayjs | null) => {
    if (value !== null) {
      setState(prevState => ({
        ...prevState,
        proposalEndTime: value.toDate(),
        votingEndTime: value.toDate(), // 设置提案结束时间和投票结束时间为选择的时间
      }));
      setProposalEndTime(value);
      setVotingEndTime(value);
      setIsProposalTimeFilled(true);
    }
  };

  const saveFormVote = (value: Dayjs | null) => {
    if (value !== null) {
      setState(prevState => ({
        ...prevState,
        votingEndTime: value.toDate(),
      }));
      setVotingEndTime(value);
      setIsEndTimeFilled(true);
    }
  };
  const saveFormType = (value: string) => {
    state.currencyType = value;
    console.log(state);
  };
  const saveFormNum = (value: string) => {
    state.numWinners = parseInt(value);
    console.log(state);
  };
  const saveFormAmount = (value: string) => {
    state.fundingAmount = parseInt(value);
    console.log(state);
  };

  const hideAlert = () => {
    setIsAlertVisible(false); // 隐藏警告
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Check if any input field is blank
    if (
      !state.title ||
      !state.description ||
      !state.numWinners ||
      !state.currencyType ||
      !state.fundingAmount
    ) {
      const errorMessage = 'Input fields should not be blank!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    // Check if proposingStartTime is earlier than the current time
    const currentTime = dayjs();
    if (proposingStartTime && proposingStartTime.isBefore(currentTime)) {
      const errorMessage = 'Time set should not be earlier than present time!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    // Check if proposalEndTime is greater than or equal to proposingStartTime
    if (proposalEndTime && proposalEndTime.isBefore(proposingStartTime)) {
      const errorMessage = 'Time set did not follow the required order!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    // Check if votingEndTime is greater than or equal to proposalEndTime
    if (votingEndTime && votingEndTime.isBefore(proposalEndTime)) {
      const errorMessage = 'Time set did not follow the required order!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    // Proceed with the form submission logic
    const round = await client.current
      .createAuction(
        new TimedAuction(
          true,
          state.title,
          state.startTime,
          state.proposalEndTime,
          state.votingEndTime,
          state.fundingAmount,
          state.currencyType,
          state.numWinners,
          state.community,
          state.communityId,
          state.balanceBlockTag,
          state.description,
        ),
      )
      .then(res => {
        console.log(res);
      })
      .catch(e => {
        console.log(e);
      });
    setFlag(true);

    setShowTimeWarning(false);
    setShowOrderWarning(false);
    setShowBlankWarning(false);
  };

  const close = () => {
    setFlag(false);
    navigate('/frontinus');
  };

  return (
    <div className={classes.blackBg}>
      <Container>
        <Row>
          <form onSubmit={handleSubmit}>
            <div className={classes.title}>Round creation</div>
            <div className={classes.desc}>
              Use this form to create a new round. Please visit our Discord if you have any
              questions: https://discord.gg/uQnjZhZPfu.
            </div>
            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                What is the round name? (Please use only standard letters, no special characters
                such as dashes or question marks)*
                <span className={classes.characterCount}>
                  {titleLength}/{MAX_TITLE_LENGTH}
                </span>
              </div>

              <input
                onChange={event => saveFormTitle(event.target.value)}
                value={state.title}
                name={'title'}
                className={classes.input}
                type="text"
              />
            </div>
            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                What is the round description? (Please use a markdown editor to format your
                description) *
                <span className={classes.characterCount1}>
                  {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <textarea
                rows={5}
                onChange={event => saveFormDesc(event.target.value)}
                value={state.description}
                name={'description'}
                className={classes.input}
              ></textarea>
            </div>
            <div className={classes.flexDiv}>
              <div className={classes.dateMain}>
                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When does the round proposing period start? (exact date and time in UTC)*
                  </div>

                  {/*<input onChange={event => saveFormStart(event.target.value)} name={'startTime'} className={classes.input} type="text"/>*/}

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => {
                          saveFormStart(newValue); // Save the value to the state as before
                          setProposingStartTime(newValue); // Save the value to the proposingStartTime state
                        }}
                        className={classes.input}
                        minDate={dayjs()} //set minDate to the current date and time
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When does the round voting period start? (exact date and time in UTC)*
                  </div>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormProposal(newValue)}
                        className={classes.input}
                        minDate={proposingStartTime}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When does the round voting period end? (exact date and time in UTC)*
                  </div>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormVote(newValue)}
                        minDate={proposingStartTime}
                        className={classes.input}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
              </div>
              <div className={classes.paddingTop}>
                <div className={classes.xian + ' ' + classes.xian1}></div>
                <div className={classes.flexDiv}>
                  <div
                    className={classes.qiu}
                    style={{
                      background: isStartTimeFilled
                        ? 'var(--qiu-color-filled)'
                        : 'var(--qiu-color-default)',
                    }}
                  ></div>
                  <div className={`${classes.qiuDesc} ${isStartTimeFilled ? classes.filled : ''}`}>
                    Start time for proposal submissions
                  </div>
                </div>

                <div className={classes.xian + ' ' + classes.xian2}></div>
                <div className={classes.flexDiv}>
                  <div
                    className={classes.qiu}
                    style={{
                      background: isProposalTimeFilled
                        ? 'var(--qiu-color-filled)'
                        : 'var(--qiu-color-default)',
                    }}
                  ></div>
                  <div
                    className={`${classes.qiuDesc} ${isProposalTimeFilled ? classes.filled : ''}`}
                  >
                    Voting Start Time
                  </div>
                </div>
                <div className={classes.xian + ' ' + classes.xian3}></div>
                <div className={classes.flexDiv}>
                  <div
                    className={classes.qiu}
                    style={{
                      background: isEndTimeFilled
                        ? 'var(--qiu-color-filled)'
                        : 'var(--qiu-color-default)',
                    }}
                  ></div>
                  <div className={`${classes.qiuDesc} ${isEndTimeFilled ? classes.filled : ''}`}>
                    Voting End Time
                  </div>
                </div>
                <div className={classes.xian + ' ' + classes.xian4}></div>
              </div>
            </div>
            <div className={classes.labelMargin}>
              <div className={classes.desc}>How many winners are there?*</div>
              <input
                onChange={event => saveFormNum(event.target.value)}
                name={'numWinners'}
                className={classes.input}
                type="number" // Add type="number" to allow only numeric input
              />
            </div>
            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                What is the symbol for the currency being used as the award? (eg $ETH, $LORDS))*
              </div>

              <input
                onChange={event => saveFormType(event.target.value)}
                name={'currencyType'}
                className={classes.input}
                type="text"
              />
            </div>
            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                How much of the award currency does each winner get?*
              </div>
              <input
                onChange={event => saveFormAmount(event.target.value)}
                name={'fundingAmount'}
                className={classes.input}
                type="number" // Add type="number" to allow only numeric input
              />
            </div>
            <button className={classes.button}>Submit</button>

            {showTimeWarning && (
              <div className={classes.popup}>
                <div className={classes.popupContent}>
                  <div className={classes.timeWarning}>
                    Time set should not be earlier than present time!
                  </div>
                  <button className={classes.closeButton} onClick={() => setShowTimeWarning(false)}>
                    Close
                  </button>
                </div>
              </div>
            )}
            {showOrderWarning && (
              <div className={classes.popup}>
                <div className={classes.popupContent}>
                  <div className={classes.timeWarning}>
                    Time set did not follow the required order!
                  </div>
                  <button
                    className={classes.closeButton}
                    onClick={() => setShowOrderWarning(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
            {showBlankWarning && (
              <div className={classes.popup}>
                <div className={classes.popupContent}>
                  <div className={classes.timeWarning}>Input bar should not be blank!</div>
                  <button
                    className={classes.closeButton}
                    onClick={() => setShowBlankWarning(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {flag && <Popup trigger={flag} onClose={close} />}
          </form>
        </Row>
      </Container>
    </div>
  );
};

export default CreateRound;
