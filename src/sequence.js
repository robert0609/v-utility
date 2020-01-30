/**
 * 计数序列辅助工具，用来计数一定时间内的第几次
 */

const timeout = 5000;
let lastSeq = 0;
let lastTimeStamp = 0;

function next() {
	if (lastTimeStamp === 0) {
		return ++lastSeq;
	}
	let currentTimeStamp = (new Date()).getTime();
	if (currentTimeStamp - lastTimeStamp > timeout) {
		lastSeq = 0;
	}
	return ++lastSeq;
}

export default {
	next
};
