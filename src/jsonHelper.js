
export function dateReviver(key, value) {
	let a;
	if (typeof value === 'string') {
		a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)/.exec(value);
		if (a) {
			let utc = new Date(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]);
			let offset = (new Date()).getTimezoneOffset();
			let localMinute = utc.getMinutes() - offset;
			utc.setMinutes(localMinute);
			return utc;
		}
	}
	return value;
}
