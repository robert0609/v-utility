let type = {
	eUndefined: 'undefined',
	eNull: 'null',
	eNumber: 'number',
	eBoolean: 'boolean',
	eString: 'string',
	eFunction: 'function',
	eRegExp: 'regexp',
	eArray: 'array',
	eDate: 'date',
	eError: 'error',
	eNode: 'node',
	eElement: 'element',
	eDocument: 'document',
	eArraylist: 'arraylist',
	eObject: 'object'
};
let class2type = {
	'undefined': type.eUndefined,
	'number': type.eNumber,
	'boolean': type.eBoolean,
	'string': type.eString,
	'function': type.eFunction,
	'[object Boolean]': type.eBoolean,
	'[object Number]': type.eNumber,
	'[object String]': type.eString,
	'[object Function]': type.eFunction,
	'[object RegExp]': type.eRegExp,
	'[object Array]': type.eArray,
	'[object Date]': type.eDate,
	'[object Error]': type.eError
};
let coreToString = class2type.toString;

/**
 * 标识当前UserAgent的字典变量
 * @type {Object}
 */
let mAgent = {
	other: 0,
	ios: 1,
	android: 2,
	windows: 3
};
/**
 * 标识承载当前页面的UserAgent的APP种别
 * @type {Object}
 */
let mApp = {
	none: 0,
	tujia: 1,
	weixin: 2,
	gaode: 3,
	qqbrowser: 4,
	ucbrowser: 5,
	hmbrowser: 6,
	baidubrowser: 7,
	safaribrowser: 8,
	_360browser: 9,
	operabrowser: 10,
	chromebrowser: 11,
	miniProgram: 12
};

function isArrayList(obj) {
	/* Real arrays are array-like
			if (obj instanceof Array)
			{
			return true;
			}*/
	// Arrays must have a length property
	if (!('length' in obj)) {
		return false;
	}
	// Length must be a number
	if (typeof obj.length !== 'number') {
		return false;
	}
	// and nonnegative
	if (obj.length < 0) {
		return false;
	}
	if (obj.length > 0) {
		// If the array is nonempty, it must at a minimum
		// have a property defined whose name is the number length-1
		if (!((obj.length - 1) in obj)) {
			return false;
		}
	}
	return true;
}

/**
 * 判断参数的类型
 * @param obj
 * @returns {type}
 */
function checkType(obj) {
	var ty = typeof obj;
	if (class2type[ty]) {
		return class2type[ty];
	}
	if (obj == null) {
		return type.eNull;
	}
	ty = coreToString.call(obj);
	if (class2type[ty]) {
		return class2type[ty];
	}
	else if (obj instanceof Element) {
		return type.eElement;
	}
	else if (obj instanceof Document) {
		return type.eDocument;
	}
	else if (obj instanceof Node) {
		return type.eNode;
	}
	else if (isArrayList(obj)) {
		return type.eArraylist;
	}
	else {
		return type.eObject;
	}
}

/**
 * 判断对象是否为空
 * @param obj
 * @returns {Boolean}
 */
function isObjectNull(obj) {
	if (obj === undefined) {
		return true;
	}
	if (!isObject(obj)) {
		throw new Error('Parameter is not an object!');
	}
	return obj === null;
}

/**
 * 判断一个变量是否未定义或者为空
 * @param v
 */
function isNullOrUndefined(v) {
	if (v === undefined) {
		return true;
	}
	return v === null;
}

/**
 * 判断数字是否是浮点型，并返回小数位数等信息
 */
function checkFloat(n) {
	var ret = {
		isNumber: false,
		isFloat: false,
		pointRightCount: 0
	};
	if (isNaN(n)) {
		return ret;
	}
	ret.isNumber = true;
	var strN = n.toString();
	var pInt = parseInt(strN);
	var pFloat = parseFloat(strN);
	if (pInt === pFloat) {
		return ret;
	}
	ret.isFloat = true;
	ret.pointRightCount = strN.length - 1 - strN.indexOf('.');
	return ret;
}

/**
 * 判断字符串是否为空
 * @param str
 * @returns {Boolean}
 */
function isStringEmpty(str) {
	var ty = checkType(str);
	if (ty === type.eUndefined || ty === type.eNull) {
		return true;
	}
	if (ty !== type.eString) {
		throw new Error('Parameter is not a string!');
	}
	if (isObject(str)) {
		return str.valueOf() === '';
	}
	else {
		return str === '';
	}
}

/**
 * 判断字符串是否是IP地址
 * @param {String} str
 * @returns {Boolean}
 */
function isIP(str) {
	return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/g.test(str);
}

/**
 * 判断参数是否为对象
 * @param obj
 * @returns {Boolean}
 */
function isObject(obj) {
	return 'undefined,number,boolean,string'.indexOf(typeof obj) < 0;
}

let hasCheckAgent = false;
let _mAgent = mAgent.other;
let _mApp = mApp.none;
function checkAgent() {
	if (!hasCheckAgent) {
		let _agent = navigator.userAgent.toLowerCase();
		if (_agent.indexOf('android') > -1) {
			_mAgent = mAgent.android;
		}
		else if (_agent.indexOf('iphone') > -1 || _agent.indexOf('ipod') > -1 || _agent.indexOf('ipad') > -1) {
			_mAgent = mAgent.ios;
		}
		else if (_agent.indexOf('windows') > -1) {
			_mAgent = mAgent.windows;
		}
		if (_agent.indexOf('micromessenger') > -1) {
			_mApp = mApp.weixin;
		}
		else if (_agent.indexOf('mqqbrowser') > -1) {
			_mApp = mApp.qqbrowser;
		}
		else if (_agent.indexOf('ucbrowser') > -1) {
			_mApp = mApp.ucbrowser;
		}
		else if (_agent.indexOf('miuibrowser') > -1) {
			if (_agent.indexOf('build/hm') > -1) {
				_mApp = mApp.hmbrowser;
			}
		}
		else if (_agent.indexOf('baidubrowser') > -1) {
			_mApp = mApp.baidubrowser;
		}
		else if (_agent.indexOf('safari') > -1) {
			_mApp = mApp.safaribrowser;
		}
		else if (_agent.indexOf('opera') > -1) {
			_mApp = mApp.operabrowser;
		}
		else if (_agent.indexOf('chrome') > -1) {
			_mApp = mApp.chromebrowser;
		}
		else if (_agent.indexOf('360') > -1) {
			_mApp = mApp._360browser;
		}
	}
	//判断是否在微信小程序内
	if (window.__wxjs_environment === 'miniprogram') {
		_mApp = mApp.miniProgram;
	}
	return { _mAgent, _mApp };
}
function agent() {
	return checkAgent()._mAgent;
}
function app() {
	return checkAgent()._mApp;
}

const DATE_MIN_VALUE = new Date(0);
const _chars16 = '0123456789ABCDEF'.split('');
/**
 * 生成GUID
 * @returns {String}
 */
function guid() {
	var uuid = [], i;
	// rfc4122, version 4 form
	var r;
	// rfc4122 requires these characters
	uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
	uuid[14] = '4';
	// Fill in random data.  At i==19 set the high bits of clock sequence as
	// per rfc4122, sec. 4.1.5
	for (i = 0; i < 36; i++) {
		if (!uuid[i]) {
			r = 0 | Math.random() * 16;
			uuid[i] = _chars16[(i == 19) ? (r & 0x3) | 0x8 : r];
		}
	}
	return uuid.join('');
}

function deepClone(target, source) {
	let typeofTarget = checkType(target);
	let typeofSource = checkType(source);
	if (typeofSource !== type.eObject) {
		throw new Error('source to clone is not object type!');
	}
	if (typeofTarget !== type.eObject) {
		target = {};
	}
	for (let k in source) {
		let sourceProperty = source[k];
		let targetProperty = target[k];
		let typeofSourceProperty = checkType(sourceProperty);
		switch (checkType(sourceProperty)) {
			case type.eObject:
				target[k] = deepClone(targetProperty, sourceProperty);
				break;
			case type.eNull:
			case type.eUndefined:
				break;
			default:
				target[k] = sourceProperty;
				break;
		}
	}
	return target;
}

export default {
	enumType: type,
	enumAgent: mAgent,
	enumApp: mApp,
	checkType,
	isObjectNull,
	isNullOrUndefined,
	checkFloat,
	isStringEmpty,
	isIP,
	isObject,
	agent,
	app,
	guid,
	get dateMinValue() {
		return DATE_MIN_VALUE;
	},
	deepClone
};
