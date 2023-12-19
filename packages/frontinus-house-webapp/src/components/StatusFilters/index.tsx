import clsx from 'clsx';
import { Dispatch, Fragment, SetStateAction } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import classes from './StatusFilters.module.css';
import {useAppSelector} from "../../hooks";
import {setHouseTab} from "../../state/slices/propHouse";
import {useDispatch} from "react-redux";

// We aren't using AuctionStatus enum becuase AuctionStatus[0] is 'not started' and we don't filter by 'not started', rather RoundStatus[0] is the default 'all rounds'
export enum RoundStatus {
  Active,
  AllRounds,
  delegateSelection,
  Pending,
  Proposing,
  Voting,
  Ended,
  BIP
}

export interface Status {
  status: RoundStatus;
  title: string;
  bgColor: string;
}





const StatusFilters: React.FC<{
  numberOfRoundsPerStatus: number[];
  currentRoundStatus: number;
  setCurrentRoundStatus: Dispatch<SetStateAction<RoundStatus>>;
  setInput: (value: string) => void;
}> = props => {
  const { numberOfRoundsPerStatus, currentRoundStatus, setCurrentRoundStatus, setInput } = props;
  const userType = useAppSelector(state => state.user.type);
  const statuses: Status[] = userType === 'Admin' ?
      [
        {
          status: RoundStatus.Active,
          title: 'Active',
          bgColor: classes.black,
        },
        {
          status: RoundStatus.AllRounds,
          title: 'All Rounds',
          bgColor: classes.black,
        },
        {
          status: RoundStatus.delegateSelection,
          title: 'Delegation Selection',
          bgColor: classes.black,
        },
        {
          status: RoundStatus.Pending,
          title: 'Pending Rounds',
          bgColor: classes.black,
        },
        {
          status: RoundStatus.BIP,
          title: 'BIPs',
          bgColor: classes.black,
        },
      ]
      :
      [
    {
      status: RoundStatus.Active,
      title: 'Active',
      bgColor: classes.black,
    },
    {
      status: RoundStatus.AllRounds,
      title: 'All Rounds',
      bgColor: classes.black,
    },
    {
      status: RoundStatus.delegateSelection,
      title: 'Delegation Selection',
      bgColor: classes.black,
    },
    {
      status: RoundStatus.BIP,
      title: 'BIPs',
      bgColor: classes.black,
    },
  ];


  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleClick = (status: RoundStatus) => {
    setInput('');
    setCurrentRoundStatus(status);
    dispatch(setHouseTab(status));
  };

  return (
    <>
      {/* desktop */}
      <div className={classes.filters}>
        {statuses.map((s, index) => {
          return (
            <Fragment key={index}>
              <div
                onClick={() => handleClick(s.status)}
                className={clsx(
                  classes.filter,
                  s.bgColor,
                  currentRoundStatus === s.status && classes.active,
                )}
              >
                <div className={classes.filterText}>
                  <span className={clsx('frontinusTitle',classes.filterName)}>{t(s.title)}</span>
                  <span className={classes.filterNumber}>{
                    s.status == RoundStatus.BIP ? numberOfRoundsPerStatus[RoundStatus.BIP] : numberOfRoundsPerStatus[index]
                  }</span>
                </div>
              </div>
              {<div className={classes.divider}></div>}
            </Fragment>
          );
        })}
      </div>

      {/* mobile */}
      <div className={clsx(classes.dropdown, 'houseDropdown')}>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {currentRoundStatus == RoundStatus.BIP ? "BIPs": t(`${statuses[currentRoundStatus].title}`)}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {statuses.map((s, index) => (
              <Fragment key={index}>
                <Dropdown.Item key={index} onClick={() => handleClick(s.status)}>
                  <span>{t(`${s.title}`)}</span>

                  <span className={classes.count}>{numberOfRoundsPerStatus[s.status]}</span>

                </Dropdown.Item>
              </Fragment>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </>
  );
};

export default StatusFilters;
