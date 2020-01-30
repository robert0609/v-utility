import 'babel-polyfill';
import { expect } from 'chai';
import ajax from '../../src/v-request';
import ajax1 from '../../src/v-request';
import { mock } from 'mockjs';

describe('v-request test', function () {
	before(function () {
		// 在本区块的所有测试用例之前执行
		mock(/getdata\/success/, 'get', {
			isSuccess: true,
			data: {
				id: 123,
				name: 'inn'
			}
		});
		mock(/getdata\/fail/, 'get', {
			isSuccess: false,
			errorCode: 1000,
			message: 'get error'
		});
		mock(/postdata\/success/, 'post', {
			isSuccess: true
		});
		mock(/postdata\/fail/, 'post', {
			isSuccess: false,
			errorCode: 1100,
			message: 'post error'
		});

		ajax1.use({
			[ajax.enumInterceptor.success]: function (data) {
				console.log(data);
			}
		});
	});

	after(function () {
		// 在本区块的所有测试用例之后执行
	});

	beforeEach(function () {
		// 在本区块的每个测试用例之前执行
	});

	afterEach(function () {
		// 在本区块的每个测试用例之后执行
	});

	it('get_success_should_return_correctly', () => {
		ajax.getPromise('/getdata/success').then(data => {
			expect(data.id).to.be.equal(123);
			expect(data.name).to.be.equal('inn');
		});
	});

	it('get_fail_should_return_correctly', () => {
		ajax.getPromise('/getdata/fail').catch(error => {
			expect(error.errorCode).to.be.equal(1000);
			expect(error.message).to.be.equal('get error');
		});
	});

	it('post_success_should_return_correctly', () => {
		ajax1.postPromise('/postdata/success').then(data => {
			expect(true).to.be.true;
		});
	});

	it('post_fail_should_return_correctly', () => {
		ajax1.postPromise('/postdata/fail').catch(error => {
			expect(error.errorCode).to.be.equal(1100);
			expect(error.message).to.be.equal('post error');
		});
	});
});
