/**
 * 封装ajax请求
 * TODO:CustomError
 */
import $ from './v-core';
import { browser } from './v-browser';
import { dateReviver } from './jsonHelper';
import seq from './sequence';

const enumInterceptor = {
	success: 'success',
	fail: 'fail'
};
const interceptorMap = new Map();
for (let v of Object.values(enumInterceptor)) {
	interceptorMap.set(v, () => true);
}

/**
 * 不同模块之间导入的ajax对象共享use的拦截器
 * TODO:如果拦截器中返回了false，则既不会调用onSuccess，也不会调用onFail，那么getPromise和postPromise方法的调用地方就会卡住了
 * @param {*} interceptors
 */
function use(interceptors) {
	for (let [k, v] of Object.entries(interceptors)) {
		if (interceptorMap.has(k) && $.checkType(v) === $.enumType.eFunction) {
			interceptorMap.set(k, v);
		}
	}
}

/**
 *
 * ajax请求接口 get
 * @param {any} [option={
 *	url: '',
 *	parameter: {}, // json
 *	returnType: 'text', // 'text'(default), 'json', 'html'
 *	onSuccess: function () { }, // result of ajax will return as onSuccess parameter
 *	onFail: function () { },
 *  onProgess: function (progressEvent) {},
 *	timeOut: 30, // seconds
 *	crossOrigin: true, // 默认开启跨域
 *	withCredentials: true,
 *	withTimestamp: true
 * }]
 * @returns
 */
function get(option = {}) {
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.__seq = seq.next();
	let fnResult = {
		abort: function () {
			if ($.isObjectNull(xmlhttp)) {
				return;
			}
			if (!xmlhttp.evoque_sptTimeout) {
				clearTimeout(xmlhttp.timeoutId);
			}
			xmlhttp.abort();
		}
	};
	let {
		url: urlTemp = urlCanNotBeEmpty(),
		parameter: parameterGet = {},
		withTimestamp = true
	} = option;
	//CORS跨域请求的URL如果是目录的话一定要以'/'结尾，否则在预检请求OPTIONS的时候会报：Response for preflight is invalid (redirect)
	urlTemp = formatPath(urlTemp);
	let spliter = '';
	if (urlTemp.indexOf('?') > -1) {
		spliter = '&';
	}
	else {
		spliter = '?';
	}
	let crossOrigin = true;
	if (withTimestamp) {
		//针对IE对ajax请求结果的缓存机制，增加时间戳参数
		// parameterGet.timestamp = (new Date()).getTime();
		parameterGet.timestamp = $.guid();
	}
	xmlhttp.open('get', urlTemp + spliter + serializeQuery(parameterGet), true);
	if (crossOrigin) {
		let { withCredentials = true } = option;
		if (withCredentials) {
			xmlhttp.withCredentials = 'true';
		}
	}
	bindEvent(xmlhttp, option, {
		url: urlTemp,
		parameter: parameterGet
	});
	xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');
	//记录发起请求的时间点
	xmlhttp.timestamp = (new Date()).getTime();
	xmlhttp.send();
	if (!xmlhttp.evoque_sptTimeout) {
		if ($.app() === $.enumApp.hmbrowser) {
			return fnResult;
		}
		xmlhttp.timeoutId = setTimeout(function () {
			xmlhttp.abort();
			xmlhttp.ontimeout();
		}, xmlhttp.timeout);
	}

	return fnResult;
}

/**
 *
 * ajax请求接口 post
 * @param {any} [option={
 *	url: '',
 *	parameter: {}, // json
 *	returnType: 'text', // 'text'(default), 'json', 'html'
 *	onSuccess: function () { }, // result of ajax will return as onSuccess parameter
 *	onFail: function () { },
 *  onProgess: function (progressEvent) {},
 *	timeOut: 30, // seconds
 *	crossOrigin: true, // 默认开启跨域
 *	withCredentials: true,
 *	withTimestamp: true
 * }]
 * @returns
 */
function post(option = {}) {
	let crossOrigin = true;
	let xmlhttp = new XMLHttpRequest();
	xmlhttp.__seq = seq.next();
	let fnResult = {
		abort: function () {
			if ($.isObjectNull(xmlhttp)) {
				return;
			}
			if (!xmlhttp.evoque_sptTimeout) {
				clearTimeout(xmlhttp.timeoutId);
			}
			xmlhttp.abort();
		}
	};
	let {
		url: urlTemp = urlCanNotBeEmpty(),
		parameter: parameterPost = {},
		withTimestamp = true
	} = option;
	//CORS跨域请求的URL如果是目录的话一定要以'/'结尾，否则在预检请求OPTIONS的时候会报：Response for preflight is invalid (redirect)
	urlTemp = formatPath(urlTemp);
	if (withTimestamp) {
		parameterPost.timestamp = $.guid();
	}
	xmlhttp.open('post', urlTemp, true);
	if (crossOrigin) {
		let { withCredentials = true } = option;
		if (withCredentials) {
			xmlhttp.withCredentials = 'true';
		}
	}
	bindEvent(xmlhttp, option, {
		url: urlTemp,
		parameter: parameterPost
	});
	xmlhttp.setRequestHeader('x-requested-with', 'XMLHttpRequest');

	if (window.FormData) {
		// 使用FormData传递post数据，无须设置Content-Type. xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		let postdata = serializeForm(parameterPost);
		//记录发起请求的时间点
		xmlhttp.timestamp = (new Date()).getTime();
		xmlhttp.send(postdata);
	}
	else {
		xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		let pain = parameterPost;
		let postdata = serializeQuery(pain);
		//记录发起请求的时间点
		xmlhttp.timestamp = (new Date()).getTime();
		xmlhttp.send(postdata);
	}
	if (!xmlhttp.evoque_sptTimeout) {
		if ($.app() === $.enumApp.hmbrowser) {
			return fnResult;
		}
		xmlhttp.timeoutId = setTimeout(function () {
			xmlhttp.abort();
			xmlhttp.ontimeout();
		}, xmlhttp.timeout);
	}
	return fnResult;
}

/**
 * 返回Promise的Get请求接口
 */
function getPromise(url = urlCanNotBeEmpty(), parameter) {
	return request(get, {
		url,
		parameter
	});
}

/**
 * 返回Promise的Post请求接口
 */
function postPromise(url = urlCanNotBeEmpty(), parameter) {
	return request(post, {
		url,
		parameter
	});
}

//===================私有輔助方法===================
function request(method = get, { url = urlCanNotBeEmpty(), ...option } = {}) {
	return new Promise((resolve, reject) => {
		method(Object.assign({ url, ...option }, {
			returnType: 'json',
			onSuccess(returnObj) {
				if (returnObj.isSuccess) {
					resolve(returnObj.data);
				}
				else {
					reject({
						errorCode: returnObj.errorCode,
						message: returnObj.message
					});
				}
			},
			onFail(ex) {
				reject({
					errorCode: null,
					message: ex.message
				});
			}
		}));
	});
}

function urlCanNotBeEmpty() {
	throw new Error('url is empty!');
}

function formatPath(path) {
	if ($.isStringEmpty(path)) {
		return '';
	}
	let query = '';
	let anchor = '';
	if (path.indexOf('?') > 0) {
		let arr = path.split('?');
		path = arr[0];
		query = arr[1];
		if (query.indexOf('#') > 0) {
			let arr1 = query.split('#');
			query = arr1[0];
			anchor = arr1[1];
		}
	}
	else if (path.indexOf('#') > 0) {
		let arr = path.split('#');
		path = arr[0];
		anchor = arr[1];
	}

	let isDirectory = true;
	if (path.lastIndexOf('.') > 0) {
		isDirectory = false;
	}
	let isAbsoluteUrl = /^https?:\/\/[^\/]/i.test(path);//eslint-disable-line no-useless-escape
	let firstChar = path.charAt(0);
	let lastChar = path.charAt(path.length - 1);
	if (!isAbsoluteUrl && firstChar !== '/') {
		path = '/' + path;
	}
	if (isDirectory && lastChar !== '/') {
		path += '/';
	}
	if (!$.isStringEmpty(query)) {
		path = path + '?' + query;
	}
	if (!$.isStringEmpty(anchor)) {
		path = path + '#' + anchor;
	}
	return path;
}

function serializeQuery(parameter) {
	let ret = '';
	for (let p in parameter) {
		let pType = $.checkType(parameter[p]);
		if (pType === $.enumType.eUndefined || pType === $.enumType.eNull) {
			continue;
		}
		ret += p;
		ret += '=';
		ret += encodeURIComponent(parameter[p].toString());
		ret += '&';
	}
	if (ret.length > 0) {
		ret = ret.slice(0, -1);
	}
	return ret;
}

function serializeForm(parameter) {
	let formData = new FormData();
	for (let p in parameter) {
		let pType = $.checkType(parameter[p]);
		if (pType === $.enumType.eUndefined || pType === $.enumType.eNull) {
			continue;
		}
		formData.append(p, parameter[p]);
	}
	return formData;
}

function bindEvent(xmlhttp, {
	returnType = 'text',
	onSuccess = function () { },
	onFail = function () { },
	onProgress = function () { },
	timeOut = 30
} = {}, debugInfo = null) {
	returnType = returnType.toLowerCase();
	let isFailed = false;
	// 设置返回值类型(android平台目前不支持returnType == 'html')
	if (returnType === 'html') {
		xmlhttp.responseType = 'document';
	}
	// 这里Chrome和Safari都不支持把 responseType 设置成'json'
	// safari不支持timeout属性
	xmlhttp.evoque_sptTimeout = true;
	if ($.checkType(xmlhttp.timeout) === $.enumType.eUndefined) {
		xmlhttp.evoque_sptTimeout = false;
	}
	xmlhttp.timeout = timeOut * 1000;
	xmlhttp.onreadystatechange = function () {
		if (xmlhttp.readyState === 4) {
			if (!xmlhttp.evoque_sptTimeout) {
				clearTimeout(xmlhttp.timeoutId);
			}
			if (xmlhttp.status === 200) {
				let resp = null;
				if ($.checkType(xmlhttp.response) === $.enumType.eUndefined) {
					resp = xmlhttp.responseText;
				}
				else {
					resp = xmlhttp.response;
				}
				if (returnType === 'json') {
					if ($.isStringEmpty(resp)) {
						let result = interceptorMap.get(enumInterceptor.success)(resp);
						if ($.checkType(result) !== $.enumType.eBoolean || result) {
							onSuccess(resp);
						}
					}
					else {
						let data = JSON.parse(resp, dateReviver);
						let result = interceptorMap.get(enumInterceptor.success)(data);
						if ($.checkType(result) !== $.enumType.eBoolean || result) {
							onSuccess(data);
						}
					}
				}
				else {
					let result = interceptorMap.get(enumInterceptor.success)(resp);
					if ($.checkType(result) !== $.enumType.eBoolean || result) {
						onSuccess(resp);
					}
				}
			}
			else {
				setTimeout(() => {
					failureHandler('failed');
				}, 0);
			}
		}
	};
	xmlhttp.onerror = function () {
		if (!xmlhttp.evoque_sptTimeout) {
			clearTimeout(xmlhttp.timeoutId);
		}
		failureHandler('error');
	};
	xmlhttp.ontimeout = function () {
		failureHandler('timeout');
	};
	xmlhttp.onabort = function () {
		failureHandler('abort');
	};
	xmlhttp.upload.onprogress = function (e) {
		onProgress(e);
	};
	xmlhttp.onloadend = function () {
		setTimeout(() => {
			xmlhttp = null;
		}, 0);
	};

	function failureHandler(kind) {
		if (!isFailed) {
			isFailed = true;
			let usetime = (new Date()).getTime() - xmlhttp.timestamp;
			if (!$.isObjectNull(debugInfo)) {
				browser.console.log(debugInfo);
				browser.console.log(kind);
				browser.console.log(xmlhttp.status);
			}
			let ex = {
				ID: $.guid(),
				type: kind,
				status: xmlhttp.status,
				response: xmlhttp.response ? xmlhttp.response : xmlhttp.responseText,
				debugInfo,
				usetime,
				xhrContext: xmlhttp,
				get message() {
					if (this.response) {
						return '请求失败，请刷新页面';
					}
					else {
						return '您的网络貌似不好，请刷新页面';
					}
				},
				get realMessage() {
					if (this.response) {
						return `请求失败。错误ID：${this.ID}，错误类型：${this.type}，错误代码：${this.status}`;
					}
					else {
						return `请求失败，返回数据为空。错误ID：${this.ID}，错误类型：${this.type}，错误代码：${this.status}`;
					}
				},
				seq: xmlhttp.__seq,
				userAgent: browser.userAgent
			};
			let result = interceptorMap.get(enumInterceptor.fail)(ex);
			if ($.checkType(result) !== $.enumType.eBoolean || result) {
				onFail(ex);
			}
		}
	}
}
//===================私有輔助方法===================

export default {
	enumInterceptor,
	get,
	post,
	getPromise,
	postPromise,
	use
};
