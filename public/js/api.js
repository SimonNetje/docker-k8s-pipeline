var API = (function() {
  function authHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + getToken()
    };
  }

  function handleResponse(res) {
    return res.json().then(function(data) {
      if (!res.ok) {
        var err = new Error(data.error || 'Request failed');
        err.status = res.status;
        throw err;
      }
      return data;
    });
  }

  function getApplications() {
    return fetch(API_BASE + '/api/applications', { headers: authHeaders() })
      .then(handleResponse);
  }

  function createApplication(data) {
    return fetch(API_BASE + '/api/applications', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name: data.name, repository_url: data.source.url })
    }).then(handleResponse);
  }

  function getDeployments() {
    return fetch(API_BASE + '/api/deployments', { headers: authHeaders() })
      .then(handleResponse);
  }

  function createDeployment(appId) {
    return fetch(API_BASE + '/api/deployments', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ application_id: appId })
    }).then(handleResponse);
  }

  function getDeployment(id) {
    return fetch(API_BASE + '/api/deployments/' + id, { headers: authHeaders() })
      .then(handleResponse);
  }

  function updateDeploymentStatus(id, status) {
    return fetch(API_BASE + '/api/deployments/' + id + '/status', {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ status: status })
    }).then(handleResponse);
  }

  return {
    getApplications: getApplications,
    createApplication: createApplication,
    getDeployments: getDeployments,
    createDeployment: createDeployment,
    getDeployment: getDeployment,
    updateDeploymentStatus: updateDeploymentStatus
  };
})();
