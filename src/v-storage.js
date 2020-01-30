import $ from './v-core';
import { dateReviver } from './jsonHelper';

let keyFormat = /v_\d+_.+/g;

/**
 *
 * @param kind: 'session' || 'storage'
 */
function wrapper(kind) {
	let dataStorage = null;
	if (kind === 'storage') {
		dataStorage = window.localStorage;
	}
	else {
		dataStorage = window.sessionStorage;
	}

	let mockStorage = genMockStorage();

	function createFunction(fn) {
		return function () {
			let support = false;
			if (kind === 'storage') {
				if (window.localStorage) {
					support = true;
				}
			}
			else {
				if (window.sessionStorage) {
					support = true;
				}
			}
			if (support) {
				if (!testStorage()) {
					dataStorage = mockStorage;
				}
			}
			else {
				console.log('Your device does not support WebStorage!');
				dataStorage = mockStorage;
			}
			return fn.apply(this, arguments);
		};
	}

	function testStorage() {
		try {
			dataStorage.setItem('testdata', 'test');
			return true;
		}
		catch (e) {
			console.log(e.message);
			return false;
		}
	}

	function genMockStorage() {
		let map = new Map();
		return {
			get length() {
				return map.size;
			},
			key(i) {
				let arrKeys = Array.from(map.keys());
				return arrKeys[i];
			},
			getItem(key) {
				return map.get(key);
			},
			setItem(key, value) {
				map.set(key, value);
			},
			removeItem(key) {
				map.delete(key);
			}
		};
	}

	/**
	 * 判断是否包含指定Key的数据
	 * @type {*}
	 */
	this.containsKey = createFunction(function (key) {
		return __seqStorer.includes(key);
	});

	/**
	 * 获取指定Key的字符串数据
	 * @type {*}
	 */
	this.getString = createFunction(function (key) {
		return this.get(key);
	});

	/**
	 * 设置指定Key的字符串数据
	 * @type {*}
	 */
	this.setString = createFunction(function (key, val, merge = false) {
		this.set(key, val, merge);
	});

	/**
	 * 获取指定Key的Json数据
	 * @type {*}
	 */
	this.getJson = createFunction(function (key) {
		return this.get(key);
	});

	/**
	 * 设置指定Key的Json数据
	 * @type {*}
	 */
	this.setJson = createFunction(function (key, val, merge = false) {
		this.set(key, val, merge);
	});

	/**
	 * 移除指定Key的数据
	 * @type {*}
	 */
	this.remove = createFunction(function (key) {
		this.del(key);
	});

	//以下是增加的缓存统一接口
	let __seqStorer = [];
	for (let i = 0; i < dataStorage.length; ++i) {
		let rawKey = dataStorage.key(i);
		keyFormat.lastIndex = 0;
		if (keyFormat.test(rawKey)) {
			let r = rawKey2real(rawKey);
			__seqStorer[r.seq] = r.realKey;
		}
	}

	function realKey2Raw(realKey) {
		let seq = __seqStorer.indexOf(realKey);
		if (seq < 0) {
			seq = __seqStorer.length;
		}
		return 'v_' + seq + '_' + realKey;
	}

	function rawKey2real(rawKey) {
		let spliterIndex0 = rawKey.indexOf('_');
		let spliterIndex1 = rawKey.indexOf('_', spliterIndex0 + 1);
		let seq = Number(rawKey.substring(spliterIndex0 + 1, spliterIndex1));
		let realKey = rawKey.substr(spliterIndex1 + 1);
		return {
			seq: seq,
			realKey: realKey
		};
	}

	function getJsonData(key) {
		let val = dataStorage.getItem(realKey2Raw(key));
		if ($.isStringEmpty(val)) {
			return null;
		}
		return JSON.parse(val, dateReviver);
	}

	function setJsonData(key, val, merge = false) {
		if (__seqStorer.indexOf(key) < 0) {
			__seqStorer.push(key);
		}
		//合并新对象模式
		if (merge) {
			val = $.deepClone(getJsonData(key), val);
		}
		dataStorage.setItem(realKey2Raw(key), JSON.stringify(val));
	}

	function delJsonData(key) {
		let seq = __seqStorer.indexOf(key);
		if (seq < 0) {
			return;
		}
		dataStorage.removeItem(realKey2Raw(key));
		delete __seqStorer[seq];
	}

	function popJsonData() {
		let filterSeq = __seqStorer.filter(function (loop) {
			return $.checkType(loop) !== $.enumType.eUndefined;
		});
		if (filterSeq.length < 1) {
			return null;
		}
		let key = filterSeq.pop();
		let obj = getJsonData(key);
		delJsonData(key);
		return obj;
	}

	function realData2Raw(obj) {
		let ty = typeof obj;
		switch (ty) {
			case 'boolean':
			case 'number':
			case 'string':
				break;
			case 'object':
				if (obj === null) {
					throw new Error('It is not able to cache null value!');
				}
				break;
			default:
				throw new Error('It is not able to cache undefined value!');
		}
		return {
			dataType: ty,
			timestamp: (new Date()).getTime(),
			value: obj
		};
	}

	function rawData2Real(obj) {
		return obj.value;
	}

	this.get = createFunction(function (key) {
		if (!this.containsKey(key)) {
			throw new Error('There is not any object in storage that its key is ' + key + '!');
		}
		let obj = getJsonData(key);
		if (!$.isObjectNull(obj)) {
			obj = rawData2Real(obj);
		}
		return obj;
	});

	this.set = createFunction(function (key, obj, merge = false) {
		setJsonData(key, realData2Raw(obj), merge);
	});

	this.del = createFunction(function (key) {
		if (this.containsKey(key)) {
			delJsonData(key);
		}
	});

	this.push = createFunction(function (key, obj) {
		if (this.containsKey(key)) {
			throw new Error('There is already an object in storage that its key is ' + key + '!');
		}
		this.set(key, obj);
	});

	this.pop = createFunction(function () {
		let obj = popJsonData();
		if (!$.isObjectNull(obj)) {
			obj = rawData2Real(obj);
		}
		return obj;
	});

	this.keys = function () {
		return __seqStorer.filter(function (loop) {
			return $.checkType(loop) !== $.enumType.eUndefined;
		});
	};
}

export default {
	session: new wrapper('session'),
	storage: new wrapper('storage')
};
