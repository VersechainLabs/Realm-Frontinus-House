import dayjs from 'dayjs';

const formatTimeAll = (time: Date | string) => {
  return dayjs(time).format('MMM D, YYYY, HH:mm');
};

export default formatTimeAll;
