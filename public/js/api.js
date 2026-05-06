var Api = (function() {
  var BASE = '/api';

  function authHeaders() {
    var token = getToken();
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  function request(path, options) {
    options = options || {};
    var headers = Object.assign({ Accept: 'application/json' }, options.headers || {});
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    return fetch(BASE + path, Object.assign({}, options, { headers: headers }))
      .then(function(response) {
        return response.text().then(function(text) {
          var data = text ? JSON.parse(text) : {};
          if (!response.ok) {
            var err = new Error(data.detail || data.message || 'Request failed');
            err.status = response.status;
            throw err;
          }
          return data;
        });
      });
  }

  function login(email, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: email, password: password })
    });
  }

  function register(name, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: name, email: email, password: password })
    });
  }

  function logout() {
    return request('/auth/logout', { method: 'POST', headers: authHeaders() }).catch(function() {});
  }

  function getApplications() {
    return request('/applications', { headers: authHeaders() });
  }

  function createApplication(data) {
    return request('/applications', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data)
    });
  }

  function getDeployments() {
    return request('/deployments', { headers: authHeaders() });
  }

  function createDeployment(appId) {
    return request('/deployments', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ application_id: Number(appId) })
    });
  }

  function updateDeploymentStatus(id, status, logs) {
    return request('/deployments/' + encodeURIComponent(id), {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: status, logs: logs || null })
    });
  }

  return {
    login: login,
    register: register,
    logout: logout,
    getApplications: getApplications,
    createApplication: createApplication,
    getDeployments: getDeployments,
    createDeployment: createDeployment,
    updateDeploymentStatus: updateDeploymentStatus
  };
})();
