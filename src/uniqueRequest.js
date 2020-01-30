import request from './v-request';

const promiseCollection = new Map();

function uniqueRequest(method = parameterCanNotBeEmpty('method'), force = false, name = parameterCanNotBeEmpty('name'), url = parameterCanNotBeEmpty('url'), parameter) {
  if (force || !promiseCollection.has(name)) {
    let prom = method(url, parameter);
    promiseCollection.set(name, prom);
  }
  return promiseCollection.get(name);
}

function parameterCanNotBeEmpty(parameterName) {
	throw new Error(`${parameterName} is empty!`);
}

export default {
  getPromise(name, url, parameter, force = false) {
    return uniqueRequest(request.getPromise, force, name, url, parameter);
  },
  postPromise(name, url, parameter, force = false) {
    return uniqueRequest(request.postPromise, force, name, url, parameter);
  }
};
