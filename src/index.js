/**
* 主模块文件
*/
import 'babel-polyfill';
import core from './v-core';
import { browser } from './v-browser';
import cookie from './v-cookie';
import request from './v-request';
import local from './v-storage';
import uniqueRequest from './uniqueRequest';

export default core;
export { browser, cookie, request, local, uniqueRequest };
