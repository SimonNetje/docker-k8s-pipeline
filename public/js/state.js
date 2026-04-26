var State = (function() {
  var APPS_KEY = 'ph_apps';
  var DEPS_KEY = 'ph_deps';

  function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || []; }
    catch(e) { return []; }
  }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  function getApps() { return load(APPS_KEY); }
  function getDeps()  { return load(DEPS_KEY); }

  function addApp(name, source) {
    var apps = getApps();
    var app = {
      id: Date.now().toString(),
      name: name,
      source_type: source.type,
      created_at: new Date().toISOString()
    };
    if (source.type === 'zip') {
      app.zip_filename = source.filename;
      app.repository_url = '';
    } else {
      app.repository_url = source.url;
    }
    apps.unshift(app);
    save(APPS_KEY, apps);
    return app;
  }

  function addDeployment(appId) {
    var deps = getDeps();
    var dep = {
      id: Date.now().toString(),
      application_id: appId,
      status: 'pending',
      created_at: new Date().toISOString(),
      logs: []
    };
    deps.unshift(dep);
    save(DEPS_KEY, deps);
    return dep;
  }

  function updateDeployment(id, patch) {
    var deps = getDeps();
    var idx = -1;
    for (var i = 0; i < deps.length; i++) {
      if (deps[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return null;
    var keys = Object.keys(patch);
    for (var j = 0; j < keys.length; j++) { deps[idx][keys[j]] = patch[keys[j]]; }
    save(DEPS_KEY, deps);
    return deps[idx];
  }

  function getDepsForApp(appId) {
    return getDeps().filter(function(d) { return d.application_id === appId; });
  }

  function getLastDeployForApp(appId) {
    var deps = getDepsForApp(appId);
    return deps.length ? deps[0] : null;
  }

  return {
    getApps: getApps,
    getDeps: getDeps,
    addApp: addApp,
    addDeployment: addDeployment,
    updateDeployment: updateDeployment,
    getDepsForApp: getDepsForApp,
    getLastDeployForApp: getLastDeployForApp
  };
})();
