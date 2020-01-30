/**
 * Cookie操作工作
 */
import $ from './v-core';

let self = {};

self.checkEnable = () => {
	if ($.checkType(navigator.cookiesEnabled) === $.enumType.eBoolean) {
		return navigator.cookiesEnabled;
	}
	else {
		let result = false;
		document.cookie = 'testcookie=yes;';
		let cookieSet = document.cookie;
		if (cookieSet.indexOf('testcookie=yes') > -1) {
			result = true;
		}
		return result;
	}
};

self.get = (key) => {
	return getCookie(key);
};

self.set = (key, val, option) => {
	setCookie(key, val, option);
};

self.remove = (key, {
	path = '/',
	domain = ''
} = {}) => {
	let date = new Date();
	//将date设置为过去的时间
	date.setTime(date.getTime() - 10000);
	let originalVal = getCookie(key);
	//构建过期cookie
	let expiredCookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=' + path;
	if (!$.isStringEmpty(domain) && domain.toLowerCase() !== 'localhost') {
		expiredCookie += '; domain=' + domain;
	}
	//将这个cookie删除
	document.cookie = expiredCookie;
};

function getCookie(key) {
	let arrCookie = document.cookie.split('; ');
	for (let i = 0; i < arrCookie.length; i++) {
		let arr = arrCookie[i].split('=');
		if (arr[0] === key) {
			return arr[1];
		}
	}
	return '';
}

function setCookie(key, val, {
	expires = $.dateMinValue,
	path = '/',
	domain = ''
} = {}) {
	//获取当前时间
	let date = new Date();
	let originalVal = getCookie(key);
	if (originalVal !== null && originalVal !== '') {
		//将date设置为过去的时间
		date.setTime(date.getTime() - 10000);
		//将这个cookie删除
		document.cookie = key + '=' + originalVal + '; expires=' + date.toUTCString() + '; path=/';
	}
	let strVal = null;
	switch ($.checkType(val)) {
		case $.enumType.eBoolean:
			strVal = val ? 'True' : 'False';
			break;
		case $.enumType.eNumber:
			strVal = val.toString();
			break;
		case $.enumType.eString:
			strVal = val;
			break;
	}
	if (!$.isStringEmpty(strVal)) {
		let strCookie = key + '=' + strVal;
		if (expires.getTime() > $.dateMinValue.getTime()) {
			strCookie += '; expires=' + expires.toUTCString();
		}
		if ($.isStringEmpty(path)) {
			strCookie += '; path=/';
		}
		else {
			strCookie += '; path=' + path;
		}
		if (!$.isStringEmpty(domain) && domain.toLowerCase() !== 'localhost') {
			strCookie += '; domain=' + domain;
		}
		document.cookie = strCookie;
	}
}

export default {
	get: self.get,
	set: self.set,
	remove: self.remove
};
