var DemoData = (function() {
  function demoResponse(value) {
    return Promise.resolve(value);
  }

  function requireDemoAuth() {
    if (isLoggedIn()) return null;
    var err = new Error('Demo session expired');
    err.status = 401;
    return err;
  }

  function getApplications() {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    return demoResponse(State.getApps());
  }

  function createApplication(data) {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    return demoResponse(State.addApp(data.name, data.source));
  }

  function getDeployments() {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    return demoResponse(State.getDeps());
  }

  function createDeployment(appId) {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    return demoResponse(State.addDeployment(appId));
  }

  function getDeployment(id) {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    var deps = State.getDeps();
    for (var i = 0; i < deps.length; i++) {
      if (deps[i].id === id) return demoResponse(deps[i]);
    }
    var notFound = new Error('Deployment not found');
    notFound.status = 404;
    return Promise.reject(notFound);
  }

  function updateDeploymentStatus(id, status) {
    var err = requireDemoAuth();
    if (err) return Promise.reject(err);
    var dep = State.updateDeployment(id, { status: status });
    if (dep) return demoResponse(dep);
    var notFound = new Error('Deployment not found');
    notFound.status = 404;
    return Promise.reject(notFound);
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
