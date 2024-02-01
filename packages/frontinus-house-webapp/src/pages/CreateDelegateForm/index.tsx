import classes from './CreateDelegateForm.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import { useEffect, useRef, useState } from 'react';
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useWalletClient } from 'wagmi';
import {getSlug, nameToSlug} from '../../utils/communitySlugs';
import { TimedAuction } from '@nouns/frontinus-house-wrapper/dist/builders';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { setAlert, clearClick, alertSlice } from '../../state/slices/alert';
import { useDispatch, useSelector } from 'react-redux';
import TextField from '@mui/material/TextField';
import { TimedDelegate } from '@nouns/frontinus-house-wrapper/dist/builders';
import { LoadingButton } from '@mui/lab';
import { utc } from 'dayjs';
import formatTimeAll from "../../utils/formatTimeAll";
import {setActiveCommunity} from "../../state/slices/propHouse";

const CreateDelegateForm: React.FC<{}> = (props) => {
  const host = useAppSelector(state => state.configuration.backendHost);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const client = useRef(new ApiWrapper(host));
  const { data: walletClient } = useWalletClient();
  useEffect(() => {
    client.current = new ApiWrapper(host, walletClient);
  }, [walletClient, host]);
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const location = useLocation();
  const slug = getSlug(location.pathname);
  const MAX_TITLE_LENGTH = 100;
  const MAX_DESCRIPTION_LENGTH = 100000;
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [showError, setShowError] = useState(false);
  const currentDate = useRef(new Date());
  const currentTime = dayjs();
  // 初始化表单中的时间字段为当前时间
  const [roundStartTime, setRoundStartTime] = useState<Dayjs | null>(currentTime);
  const [grantStartTime, setGrantStartTime] = useState<Dayjs | null>(currentTime);
  const [grantEndTime, setGrantEndTime] = useState<Dayjs | null>(currentTime);
  const [roundEndTime, setRoundEndTime] = useState<Dayjs | null>(currentTime);
  // const [showOrderWarning, setShowOrderWarning] = useState(false);
  // const [showBlankWarning, setShowBlankWarning] = useState(false);

  const [isStartTimeFilled, setIsStartTimeFilled] = useState(false);
  const [isProposalTimeFilled, setIsProposalTimeFilled] = useState(false);
  const [isVotingTimeFilled, setIsVotingTimeFilled] = useState(false);
  const [isEndTimeFilled, setIsEndTimeFilled] = useState(false);

  // const [isStartDatePickerOpen, setIsStartDatePickerOpen] = useState(false);

  // const alertType = useSelector(state => state.alert.type);
  // const alertMessage = useSelector(state => state.alert.message);
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [isSuccessAlertVisible, setIsSuccessAlertVisible] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [failedLoadingCommunity, setFailedLoadingCommunity] = useState(false);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const community = await client.current.getCommunityWithName(slug);
        dispatch(setActiveCommunity(community));
        setLoadingCommunity(false);
      } catch (e) {
        setLoadingCommunity(false);
        setFailedLoadingCommunity(true);
      }
    };
    fetchCommunity();
  }, [slug, dispatch]);

  const [state, setState] = useState({
    description: '',
    title: '',
    startTime: new Date(''),
    endTime: new Date(''),
    proposalEndTime: new Date(''),
    votingEndTime: new Date(''),
  });
  const [flag, setFlag] = useState(false);

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
      const utcValue = utc(value.format());
      setState(prevState => ({
        ...prevState,
        startTime: utcValue.toDate(),
      }));
      setRoundStartTime(utcValue);
      setIsStartTimeFilled(true);
    } else {
      setRoundStartTime(null);
      setIsStartTimeFilled(false);
    }
  };

  const saveFormProposal = (value: Dayjs | null) => {
    if (value !== null) {
      const utcValue = utc(value.format());
      setState(prevState => ({
        ...prevState,
        proposalEndTime: utcValue.toDate(),
      }));
      setGrantStartTime(utcValue);
      setIsProposalTimeFilled(true);
    } else {
      setGrantStartTime(null);
      setIsProposalTimeFilled(false);
    }
  };

  const saveFormVote = (value: Dayjs | null) => {
    if (value !== null) {
      const utcValue = utc(value.format());
      setState(prevState => ({
        ...prevState,
        votingEndTime: utcValue.toDate(),
      }));
      setGrantEndTime(utcValue);
      setIsVotingTimeFilled(true);
    } else {
      setGrantEndTime(null);
      setIsVotingTimeFilled(false);
    }
  };

  const saveFormEnd = (value: Dayjs | null) => {
    if (value !== null) {
      const utcValue = utc(value.format());
      setState(prevState => ({
        ...prevState,
        endTime: utcValue.toDate(),
      }));
      setRoundEndTime(utcValue);
      setIsEndTimeFilled(true);
    } else {
      setRoundEndTime(null);
      setIsEndTimeFilled(false);
    }
  };
  const hideAlert = () => {
    setIsAlertVisible(false); // 隐藏警告
  };
  // const openStartDatePicker = () => {
  //   setIsStartDatePickerOpen(true);
  // };

  const handleSubmit = async (e: any) => {
    //该方法阻止表单的提交
    e.preventDefault();

    if (
      !state.description.trim() ||
      !state.title.trim() ||
      !isStartTimeFilled ||
      !isProposalTimeFilled ||
      !isVotingTimeFilled ||
      !isEndTimeFilled
    ) {
      const errorMessage = 'You must complete all the fields before submit!';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    const currentTime = dayjs();
    if (state.startTime < currentDate.current) {
      const errorMessage =
        'Application submissions should commence at the current time or later, not earlier.';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }
    // 检查是否有时间比上一个时间要早的情况
    if (grantStartTime && roundStartTime && grantStartTime <= roundStartTime) {
      const errorMessage =
        'The time to select delegates should begin no earlier than the start time of application submissions.';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    if (grantEndTime && grantStartTime && grantEndTime <= grantStartTime) {
      const errorMessage =
        'The selection period end time must be later than the selection start time.';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    if (roundEndTime && grantEndTime && roundEndTime <= grantEndTime) {
      const errorMessage =
        'The delegation round end time must be later than the selection end time.';
      console.log('Error message to be dispatched:', errorMessage);
      dispatch(setAlert({ type: 'error', message: errorMessage }));
      setIsAlertVisible(true); // 显示alert弹出框
      return;
    }

    console.log(state);
    const delegate = new TimedDelegate(
      state.title,
      state.startTime,
      state.endTime,
      state.proposalEndTime,
      state.votingEndTime,
      state.description,
      community.id,
      community.id,
    );
    setIsButtonDisabled(true);
    client.current
      .createDelegateAuction(delegate)
      .then((round: any) => {
        setIsSuccessAlertVisible(true); // 显示成功提示
        dispatch(setAlert({ type: 'success', message: 'Submit Successfully' }));
        navigate('/' + getSlug(location.pathname) + '/delegateDetails/' + round.id + "-" + nameToSlug(round.title));
      })
      .catch(e  => {
        setIsButtonDisabled(false);
        setFlag(false);
        var msg = '';

        if (e.status == 417) {
          const data = JSON.parse(e.message);
          msg = 'The time to end the selection period is in conflict with the current active delegation. Please select a time that is later than '+formatTimeAll(data.endTime)+'.';
          dispatch(
              setAlert({
                type: 'error',
                message: msg,
              }),
          );
          setIsAlertVisible(true); // 显示alert弹出框
        }

        if (e.status == 400 && typeof(e.message) == 'string' ){
          msg = e.message;
          dispatch(
              setAlert({
                type: 'error',
                message: msg,
              }),
          );
          setIsAlertVisible(true); // 显示alert弹出框
        }


      });
  };

  return (
    <div className={classes.blackBg}>
      <Container>
        <Row>
          <form onSubmit={handleSubmit}>
            <div className={classes.title}>Delegation Round Creation</div>
            <div className={classes.desc1}>
              Use this form to create a new delegation round. Please visit our Discord if you have
              any questions:{' '}
              <a
                href={community && community.discordLink}
                target="_blank"
                className={classes.alink}
                rel="noreferrer"
              >
                {community && community.discordLink}
              </a>
              .
            </div>

            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                What is the delegation round name?*
                <span className={classes.characterCount}>
                  {titleLength}/{MAX_TITLE_LENGTH}
                </span>
              </div>

              <input
                onChange={event => saveFormTitle(event.target.value)}
                name={'title'}
                value={state.title}
                className={classes.input}
                type="text"
                style={{
                  height: '40px',
                }}
              />
            </div>

            <div className={classes.labelMargin}>
              <div className={classes.desc}>
                What is the description of this round of delegation? (Please use a markdown editor
                to format your description) *
                <span className={classes.characterCount1}>
                  {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
                </span>
              </div>

              <textarea
                rows={4}
                onChange={event => saveFormDesc(event.target.value)}
                value={state.description}
                name={'description'}
                className={classes.input}
              />
            </div>
            <div className={classes.flexDiv}>
              <div className={classes.dateMain}>
                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When does the delegation round start accepting applications?*
                  </div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormStart(newValue)}
                        className={classes.input}
                        minDate={dayjs()}
                        ampm={false}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>

                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When can community members start granting voting power to delegate applicants?*
                  </div>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormProposal(newValue)}
                        className={classes.input}
                        minDate={dayjs()}
                        ampm={false}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>

                <div className={classes.labelMargin}>
                  <div className={classes.desc}>
                    When is the last day community members can grant voting power to delegate
                    applicants?*
                  </div>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormVote(newValue)}
                        className={classes.input}
                        minDate={dayjs()}
                        ampm={false}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
                <div className={classes.labelMargin}>
                  <div className={classes.desc}>When does the delegation round end?*</div>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DateTimePicker']}>
                      <DateTimePicker
                        onChange={newValue => saveFormEnd(newValue)}
                        className={classes.input}
                        minDate={dayjs()}
                        ampm={false}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </div>
              </div>
              <div className={classes.paddingTop + ' ' + classes.flexDiv}>
                <div>
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

                  </div>
                  <div className={classes.xian + ' ' + classes.xian3}></div>
                  <div className={classes.flexDiv}>
                    <div
                        className={classes.qiu}
                        style={{
                          background: isVotingTimeFilled
                              ? 'var(--qiu-color-filled)'
                              : 'var(--qiu-color-default)',
                        }}
                    ></div>

                  </div>
                  <div className={classes.xian + ' ' + classes.xian4}></div>
                  <div className={classes.flexDiv}>
                    <div
                        className={classes.qiu}
                        style={{
                          background: isEndTimeFilled
                              ? 'var(--qiu-color-filled)'
                              : 'var(--qiu-color-default)',
                        }}
                    ></div>

                  </div>
                  <div className={classes.xian + ' ' + classes.xian5}></div>
                </div>
                <div>
                  <div className={`${classes.qiuDesc} ${classes.paddingTop1} ${isStartTimeFilled ? classes.filled : ''}`}>
                    Time to start accepting applicants
                  </div>
                  <div
                      className={`${classes.qiuDesc} ${classes.paddingTop2} ${isProposalTimeFilled ? classes.filled : ''}`}
                  >
                    Time to select delegates
                  </div>
                  <div className={`${classes.qiuDesc} ${classes.paddingTop3} ${isVotingTimeFilled ? classes.filled : ''}`}>
                    Time to end selection period
                  </div>
                  <div className={`${classes.qiuDesc} ${classes.paddingTop4} ${isEndTimeFilled ? classes.filled : ''}`}>
                    Delegation End Time
                  </div>
                </div>

              </div>
            </div>
            <div className={classes.button}>
              <LoadingButton
                loading={isButtonDisabled} // Pass the loading state here
                type="submit" // Make sure to set the type attribute to "submit"
                variant="outlined"
                disabled={isButtonDisabled} // Disable the button while loading
                style={{ textTransform: 'capitalize' }}
              >
                Submit
              </LoadingButton>
            </div>
            {isAlertVisible && (
              <div className={classes.popup} onClick={hideAlert}>
                <div className={classes.popupContent}>
                  {/* 显示alert中的错误信息 */}
                  {/* <span className={classes.error}>{state.message}</span> */}
                </div>
              </div>
            )}
          </form>
        </Row>
      </Container>
    </div>
  );
};

export default CreateDelegateForm;
