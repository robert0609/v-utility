import { expect } from 'chai';
import { browser } from '../../src/v-browser';

describe('v-browser test', () => {
	it('url_should_add_some_parameters_correctly', () => {
		let url = browser.location.addParameter({ a: 123, b: 'test' }, '/webapi/portal/get/');
		expect(url).to.be.equal('/webapi/portal/get/?a=123&b=test');
	});

	it('url_should_remove_some_parameters_correctly', () => {
		let url = browser.location.removeParameter(['a', 'c'], '/webapi/portal/?a=1&b=ttt&c=false#but');
		expect(url).to.be.equal('/webapi/portal/?b=ttt#but');
	});

	it('url_should_be_analyzed_correctly', () => {
		let result = browser.location.analyze('https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('mp.weixin.qq.com');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.sameDomain).to.be.false;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('');

		result = browser.location.analyze('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.isAbsoluteUrl).to.be.false;
		expect(result.host).to.be.equal('');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.sameDomain).to.be.true;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('');

		result = browser.location.analyze('http://139.219.107.152:8888/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('139.219.107.152:8888');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		expect(result.sameDomain).to.be.false;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('');

		result = browser.location.analyze('http://m.vashare.com');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('m.vashare.com');
		expect(result.path).to.be.equal('');
		expect(result.sameDomain).to.be.false;
		expect(Object.keys(result.query).length).to.be.equal(0);
		expect(result.anchor).to.be.equal('');

		result = browser.location.analyze('http://m.vashare.com/');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('m.vashare.com');
		expect(result.path).to.be.equal('/');
		expect(result.sameDomain).to.be.false;
		expect(Object.keys(result.query).length).to.be.equal(0);
		expect(result.anchor).to.be.equal('');

		try {
			let result = browser.location.analyze('');
		}
		catch (e) {
			expect(e).to.be.an('error');
			expect(e.message).to.be.equal('url is error');
		}

		result = browser.location.analyze('/');
		expect(result.isAbsoluteUrl).to.be.false;
		expect(result.host).to.be.equal('');
		expect(result.path).to.be.equal('/');
		expect(result.sameDomain).to.be.true;
		expect(Object.keys(result.query).length).to.be.equal(0);
		expect(result.anchor).to.be.equal('');

		try {
			let result = browser.location.analyze('https://mp.weixin.qq.com//cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2');
		}
		catch (e) {
			expect(e).to.be.an('error');
			expect(e.message).to.be.equal('url is error');
		}

		result = browser.location.analyze('https://mp.weixin.qq.com/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('mp.weixin.qq.com');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.sameDomain).to.be.false;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('title');

		result = browser.location.analyze('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.isAbsoluteUrl).to.be.false;
		expect(result.host).to.be.equal('');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.sameDomain).to.be.true;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('title');

		result = browser.location.analyze('http://139.219.107.152:8888/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('139.219.107.152:8888');
		expect(result.path).to.be.equal('/cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		expect(result.sameDomain).to.be.false;
		expect(result.query.action).to.be.equal('getannouncement');
		expect(result.anchor).to.be.equal('title');

		result = browser.location.analyze('http://m.vashare.com/#title');
		expect(result.isAbsoluteUrl).to.be.true;
		expect(result.host).to.be.equal('m.vashare.com');
		expect(result.path).to.be.equal('/#title');
		expect(result.sameDomain).to.be.false;
		expect(Object.keys(result.query).length).to.be.equal(0);
		expect(result.anchor).to.be.equal('title');

		try {
			let result = browser.location.analyze('');
		}
		catch (e) {
			expect(e).to.be.an('error');
			expect(e.message).to.be.equal('url is error');
		}

		result = browser.location.analyze('/#title');
		expect(result.isAbsoluteUrl).to.be.false;
		expect(result.host).to.be.equal('');
		expect(result.path).to.be.equal('/#title');
		expect(result.sameDomain).to.be.true;
		expect(Object.keys(result.query).length).to.be.equal(0);
		expect(result.anchor).to.be.equal('title');

		try {
			let result = browser.location.analyze('https://mp.weixin.qq.com//cgi-bin/announce?action=getannouncement&key=1463324905&version=1&lang=zh_CN&platform=2#title');
		}
		catch (e) {
			expect(e).to.be.an('error');
			expect(e.message).to.be.equal('url is error');
		}




	});
});
