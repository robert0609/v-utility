import $ from './v-core';
import { MatrixClass } from 'v-math';

let rootDomainCache = '';
const absoluteUrlRegex = /^(https?:)?\/\/(([\dA-Za-z\-]+(\.[\dA-Za-z\-]+)+)|localhost)(:\d+)?((\/[\w\-\.]+)*(\/|(\.[\dA-Za-z]+))?)?(\?[^#\f\n\r]*)?(#[^\f\n\r]*)?$/; //eslint-disable-line
const relativeUrlRegex = /^(\/[\w\-\.]+)*(\/|(\.[\dA-Za-z]+))?(\?[^#\f\n\r]*)?(#[^\f\n\r]*)?$/; //eslint-disable-line

let browser = {
	location: {
		addParameter: function (query, url = location.href) {
			var queryDic = {};
			var idx = url.indexOf('?');
			var anchorIdx = url.indexOf('#');
			var anchor = '';
			if (idx > -1) {
				if (anchorIdx > -1) {
					queryDic = queryStr2Dic(url.substr(idx, anchorIdx - idx));
					anchor = url.substr(anchorIdx);
					url = url.substr(0, idx);
				}
				else {
					queryDic = queryStr2Dic(url.substr(idx));
					url = url.substr(0, idx);
				}
			}
			else if (anchorIdx > -1) {
				anchor = url.substr(anchorIdx);
				url = url.substr(0, anchorIdx);
			}
			for (var p in query) {
				queryDic[p] = encodeURIComponent(query[p]);
			}
			return url + queryDic2Str(queryDic) + anchor;
		},
		removeParameter: function (parameterNames, url = location.href) {
			var queryDic = {};
			var idx = url.indexOf('?');
			var anchorIdx = url.indexOf('#');
			var anchor = '';
			if (idx > -1) {
				if (anchorIdx > -1) {
					queryDic = queryStr2Dic(url.substr(idx, anchorIdx - idx));
					anchor = url.substr(anchorIdx);
					url = url.substr(0, idx);
				}
				else {
					queryDic = queryStr2Dic(url.substr(idx));
					url = url.substr(0, idx);
				}
			}
			else if (anchorIdx > -1) {
				anchor = url.substr(anchorIdx);
				url = url.substr(0, anchorIdx);
			}
			parameterNames.forEach((elem) => {
				if (elem in queryDic) {
					delete queryDic[elem];
				}
			});
			return url + queryDic2Str(queryDic) + anchor;
		},
		get rootDomain() {
			if ($.isStringEmpty(rootDomainCache)) {
				rootDomainCache = getRootDomain();
			}
			return rootDomainCache;
		},
		analyze
	},
	console: {
		log(msg) {
			return console.log(msg); // eslint-disable-line no-console
		}
	},
	page: {
		getRectangle(element, absolute = false) {
			let offsetTop = getOffsetTop(element, absolute);
			let offsetLeft = getOffsetLeft(element, absolute);

			return {
				top: offsetTop,
				left: offsetLeft,
				bottom: offsetTop + element.offsetHeight,
				right: offsetLeft + element.offsetWidth,
				width: element.offsetWidth,
				height: element.offsetHeight
			};
		}
	},
	get userAgent() {
		return navigator.userAgent.toLowerCase();
	}
};

/**
 * 计算元素经过了2D transform之后与原来位置的left和top的偏移量
 * @param {HTMLElement} element
 */
function computeTransformOffset(element) {
  let style = window.getComputedStyle(element);
  let width = Number(style.width.split('px')[0]), height = Number(style.height.split('px')[0]);
  let transform = style.transform;
  let transformOrigin = style.transformOrigin;
  if (!$.isStringEmpty(transform) && transform !== 'none') {
    let s = transform.indexOf('(');
    let e = transform.indexOf(')');
    let arr = transform.substring(s + 1, e).split(',');
    //构建变形变换矩阵
    let changeMatrix = new MatrixClass([
      [Number(arr[0].trim()), Number(arr[2].trim()), Number(arr[4].trim())],
      [Number(arr[1].trim()), Number(arr[3].trim()), Number(arr[5].trim())],
      [0, 0, 1]
    ]);
    //构建基变换矩阵
    let arr1 = transformOrigin.split('px');
    let axisMatrix = new MatrixClass([
      [1, 0, Number(arr1[0].trim())],
      [0, 1, Number(arr1[1].trim())],
      [0, 0, 1]
    ]);
    let inverseAxisMatrix = new MatrixClass([
      [1, 0, 0 - Number(arr1[0].trim())],
      [0, 1, 0 - Number(arr1[1].trim())],
      [0, 0, 1]
    ]);
    //得到基于元素左上角位置的坐标系的最终变换矩阵
    let finalChangeMatrix = axisMatrix.multiply(changeMatrix).multiply(inverseAxisMatrix);
    let finalLeftTop = finalChangeMatrix.multiply(new MatrixClass([
      [0],
      [0],
      [1]
    ]));
    let finalRightTop = finalChangeMatrix.multiply(new MatrixClass([
      [width],
      [0],
      [1]
    ]));
    let finalLeftBottom = finalChangeMatrix.multiply(new MatrixClass([
      [0],
      [height],
      [1]
    ]));
    let finalRightBottom = finalChangeMatrix.multiply(new MatrixClass([
      [width],
      [height],
      [1]
    ]));
    return {
      offsetLeft: Math.min(finalLeftTop.element(0, 0), finalRightTop.element(0, 0), finalLeftBottom.element(0, 0), finalRightBottom.element(0, 0)),
      offsetTop: Math.min(finalLeftTop.element(1, 0), finalRightTop.element(1, 0), finalLeftBottom.element(1, 0), finalRightBottom.element(1, 0))
    };
  }
  else {
    return {
      offsetLeft: 0,
      offsetTop: 0
    };
  }
}

function getOffsetTop(element, absolute = false) {
  let currentOffsetTop = element.offsetTop;
  let { offsetTop } = computeTransformOffset(element);
  currentOffsetTop += offsetTop;
  if (absolute) {
    let style = window.getComputedStyle(element);
    if (style.position === 'fixed') {
      currentOffsetTop += getScrollTop();
    }
    if (element.offsetParent) {
      let parentOffsetTop = getOffsetTop(element.offsetParent, absolute);
      currentOffsetTop += parentOffsetTop;
    }
  }
  return currentOffsetTop;
}

function getOffsetLeft(element, absolute = false) {
  let currentOffsetLeft = element.offsetLeft;
  let { offsetLeft } = computeTransformOffset(element);
  currentOffsetLeft += offsetLeft;
  if (absolute && element.offsetParent) {
    let parentOffsetLeft = getOffsetLeft(element.offsetParent, absolute);
    currentOffsetLeft += parentOffsetLeft;
  }
  return currentOffsetLeft;
}

function getScrollTop() {
  return document.documentElement.scrollTop || document.body.scrollTop;
}

function getScrollLeft() {
  return document.documentElement.scrollLeft || document.body.scrollLeft;
}

function analyze(url) {
	let isAbsoluteUrl = absoluteUrlRegex.test(url);
	let isRelativeUrl = relativeUrlRegex.test(url);
	if (!isAbsoluteUrl && !isRelativeUrl) {
		throw new Error('url is error');
	}
	let result = null;
	if (isAbsoluteUrl) {
		let idxDoubleSlash = url.indexOf('//');
		url = url.substr(idxDoubleSlash + 2);
		let idxSlash = url.indexOf('/');
		let host = url;
		let path = '';
		if (idxSlash > -1) {
			host = url.substr(0, idxSlash);
			path = url.substr(idxSlash);
		}
		result = {
			isAbsoluteUrl: true,
			sameDomain: host === location.host,
			host,
			path
		};
	}
	else {
		result = {
			isAbsoluteUrl: false,
			sameDomain: true,
			host: '',
			path: url
		};
	}
	let questionMarkIndex = result.path.indexOf('?');
	let anchorMarkIndex = result.path.indexOf('#');
	if (questionMarkIndex > -1) {
		if (anchorMarkIndex > -1) {
			result.query = queryStr2Dic(result.path.substr(questionMarkIndex, (anchorMarkIndex - questionMarkIndex)));
			result.anchor = result.path.substr(anchorMarkIndex + 1);
		}
		else {
			result.query = queryStr2Dic(result.path.substr(questionMarkIndex));
			result.anchor = '';
		}
	}
	else {
		if (anchorMarkIndex > -1) {
			result.query = {};
			result.anchor = result.path.substr(anchorMarkIndex + 1);
		}
		else {
			result.query = {};
			result.anchor = '';
		}
	}

	return result;
}

function getRootDomain() {
	try {
		let urlHost = location.hostname.toLowerCase();
		let urlHostArray = urlHost.split('.');
		if ((urlHostArray.length < 3) || $.isIP(urlHost)) {
			return urlHost;
		}
		let urlHost2 = urlHost.substr(urlHost.indexOf('.') + 1);
		if (urlHost2.startsWith('com.') || urlHost2.startsWith('net.') || urlHost2.startsWith('org.') || urlHost2.startsWith('gov.')) {
			return urlHost;
		}
		else {
			return urlHost2;
		}
	}
	catch (e) {
		return '';
	}
}

function queryStr2Dic(str) {
	if ($.isStringEmpty(str)) {
		return {};
	}
	var dic = {};
	var kvps = str.substr(1).split('&');
	for (var i = 0; i < kvps.length; ++i) {
		var kv = kvps[i].split('=');
		var k = kv[0];
		var v = '';
		if (kv.length > 1) {
			v = kv[1];
		}
		dic[k] = v;
	}
	return dic;
}
function queryDic2Str(dic) {
	var str = '';
	var arr = [];
	for (var k in dic) {
		var v = dic[k];
		var kv = k + '=' + v;
		arr.push(kv);
	}
	if (arr.length > 0) {
		str = '?' + arr.join('&');
	}
	return str;
}

export { browser };
