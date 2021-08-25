'use strict';

const axios = require('axios');

class GitLab {

  //выполнить запрос на сервер
  async http(method, data) {
    const resp = this.response = await axios({
      url: this.url.toString(),
      method: method,
      timeout: this.timeout,
      headers: { Authorization: `Bearer ${this.token}` },
      data,
      responseType: 'json',
      validateStatus: status => true,
    });
    this.result = resp.data;
    return resp.status >= 200 && resp.status < 400;
  }

  prepare(options) {
    this.timeout = options.timeout || 10000;
    this.token = options.token;

    const url = this.url = new URL(options.host);
    url.pathname !== '/' && (url.pathname += '/');
    url.pathname += 'api/v4/projects';
  }

  setUri(value) {
    value && (this.url.pathname += value);
  }

  setPath(value) {
    value && (this.url.pathname += `/repository/files/${value}`);
  }

  setProject(value) {
    value && (this.url.pathname += `/${value}`);
  }

  setBranch(value) {
    value && this.url.searchParams.append('ref', value);
  }

  setUriParam(name, value) {
    name && value && this.url.searchParams.append(name, value);
  }

  errorResponse() {
    return new Error(this.result.message || this.result.error);
  }

  //получить список веток
  async branchList(options) {
    this.prepare(options);
    this.setProject(options.project);
    this.setUri('/repository/branches');

    if (await this.http('get'))
      return this.result.map(branch => branch.name);

    throw this.errorResponse();
  }

  //создать ветку
  async branchNew(options) {
    this.prepare(options);
    this.setProject(options.project);
    this.setBranch(options.branch);
    this.setUriParam('branch', options.name);
    this.setUri('/repository/branches');

    if (await this.http('post'))
      return this.result.name;

    throw this.errorResponse();
  }

  //получить список проектов
  async projectList(options) {
    this.prepare(options);

    if (await this.http('get')) {
      const result = this.result
        .filter(project => project.permissions.project_access || project.permissions.group_access)
      result.sort((a, b) => {
        const result = (a.namespace.kind === 'group' ? 0 : 1) - (b.namespace.kind === 'group' ? 0 : 1);
        if (result === 0) {
          a = a.name;
          b = b.name;
          return a < b ? -1 : (a > b ? 1 : 0);
        }
        return result;
      });
      return result.map(project => {
        return {
          id: project.id,
          name: project.name_with_namespace,
          path: project.path_with_namespace,
        };
      });
    }
    throw this.errorResponse();
  }


  //получить файл с сервера
  async pull(options) {
    this.prepare(options);
    this.setProject(options.project);
    this.setPath(options.path);
    this.setBranch(options.branch);
    this.setUri('/raw');

    if (await this.http('get'))
      return JSON.stringify(this.result);

    throw this.errorResponse();
  }

  //сохранить файл на сервер
  async push(options) {
    this.prepare(options);
    this.setProject(options.project);
    this.setPath(options.path);
    this.setBranch(options.branch);

    const data = {
      branch: options.branch,
      commit_message: options.message,
      content: JSON.stringify(JSON.parse(options.content), null, 2),
    }

    if (await this.http('put', data))
      return true;

    if (await this.http('post', data))
      return true;

    throw this.errorResponse();
  }

}

module.exports = GitLab;
