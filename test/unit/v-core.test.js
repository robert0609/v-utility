import { expect } from 'chai';
import $ from '../../src/v-core';

describe('v-core test', () => {
	it('checktype_should_return_correctly', () => {
		let typ = $.checkType(function () {});
		expect(typ).to.be.equal($.enumType.eFunction);

		expect($.checkType(undefined)).to.be.equal($.enumType.eUndefined);
		expect($.checkType(null)).to.be.equal($.enumType.eNull);
		expect($.checkType(34)).to.be.equal($.enumType.eNumber);
		expect($.checkType(true)).to.be.equal($.enumType.eBoolean);
		expect($.checkType(/\d/g)).to.be.equal($.enumType.eRegExp);
		expect($.checkType([1, 'w', false])).to.be.equal($.enumType.eArray);
		expect($.checkType(new Date())).to.be.equal($.enumType.eDate);
		expect($.checkType(new Error('test error'))).to.be.equal($.enumType.eError);
		expect($.checkType(document.createElement('div'))).to.be.equal($.enumType.eElement);
		expect($.checkType({
			length: 3,
			'1': 'a',
			2: true
		})).to.be.equal($.enumType.eArraylist);
		expect($.checkType({})).to.be.equal($.enumType.eObject);
	});

	it('isObjectNull_should_return_correctly', () => {
		expect($.isObjectNull(undefined)).to.be.true;
		expect($.isObjectNull(null)).to.be.true;
		expect($.isObjectNull({})).to.be.false;
	});

	it('isNullOrUndefined_should_return_correctly', () => {
		expect($.isNullOrUndefined(null)).to.be.true;
		expect($.isNullOrUndefined(undefined)).to.be.true;
		expect($.isNullOrUndefined('')).to.be.false;
	});

	it('checkFloat_should_return_correctly', () => {
		let result = $.checkFloat(1.05483);
		expect(result.isFloat).to.be.true;
		expect(result.isNumber).to.be.true;
		expect(result.pointRightCount).to.be.equal(5);
	});

	it('isStringEmpty_should_return_correctly', () => {
		expect($.isStringEmpty(null)).to.be.true;
		expect($.isStringEmpty(undefined)).to.be.true;
		expect($.isStringEmpty('')).to.be.true;
		expect($.isStringEmpty('null')).to.be.false;

		try {
			let result = $.isStringEmpty({});
		}
		catch (e) {
			expect(e).to.be.an('error');
			expect(e.message).to.be.equal('Parameter is not a string!');
		}
	});

	it('isIP_should_return_correctly', () => {
		expect($.isIP('10.2.10.18')).to.be.true;
		expect($.isIP('12.dg.3r3gfsd#$^$')).to.be.false;
	});

	it('isObject_should_return_correctly', () => {
		expect($.isObject({})).to.be.true;
		expect($.isObject(undefined)).to.be.false;
		expect($.isObject(null)).to.be.true;
		expect($.isObject(true)).to.be.false;
		expect($.isObject('undefined')).to.be.false;
	});

});
