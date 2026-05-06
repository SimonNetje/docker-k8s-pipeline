var DemoData = (function() {
  function requireAuth() {
    if (isLoggedIn()) return null;
    var err = new Error('Session expired');
    err.status = 401;
    return err;
  }

  function getApplications() {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.getApplications();
  }

  function createApplication(data) {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.createApplication(data);
  }

  function getDeployments() {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.getDeployments();
  }

  function createDeployment(appId) {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.createDeployment(appId);
  }

  function getDeployment(id) {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.getDeployments().then(function(deps) {
      for (var i = 0; i < deps.length; i++) {
        if (String(deps[i].id) === String(id)) return deps[i];
      }
      var notFound = new Error('Deployment not found');
      notFound.status = 404;
      throw notFound;
    });
  }

  function updateDeploymentStatus(id, status, logs) {
    var err = requireAuth();
    if (err) return Promise.reject(err);
    return Api.updateDeploymentStatus(id, status, logs);
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
