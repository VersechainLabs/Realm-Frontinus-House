// import dayjs from 'dayjs';
import moment from 'moment';

const diffTime = (time: Date | string) => {
	// return dayjs(time).fromNow()
	return moment(time).fromNow()
}

export default diffTime;
