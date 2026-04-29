var activeView = 'applications';
var metricsInterval = null;
var sourceMode = 'github';
var _simState = {};

var DEPLOY_STEPS = [
  { status: 'building',  pct: 12,  log: 'Cloning repository…' },
  { status: 'building',  pct: 27,  log: '✔ Repository cloned' },
  { status: 'building',  pct: 41,  log: 'Installing dependencies…' },
  { status: 'building',  pct: 56,  log: '✔ Dependencies installed' },
  { status: 'building',  pct: 70,  log: 'Building application…' },
  { status: 'building',  pct: 82,  log: '✔ Build successful' },
  { status: 'deploying', pct: 90,  log: 'Provisioning Kubernetes pod…' },
  { status: 'deploying', pct: 96,  log: 'Configuring ingress…' },
  { status: 'running',   pct: 100, log: '✔ Deployment live' }
];

// ── View switching ────────────────────────────────
function showView(name) {
  activeView = name;
  ['applications', 'deployments', 'metrics'].forEach(function(v) {
    var el = document.getElementById('view-' + v);
    if (el) el.style.display = (v === name) ? '' : 'none';
  });
  document.querySelectorAll('.dash-sidebar-link, .dash-mobile-tab').forEach(function(l) {
    l.classList.toggle('is-active', l.dataset.view === name);
  });
  if (name === 'applications') renderApplications();
  if (name === 'deployments')  renderDeployments();
  if (name === 'metrics')      { renderMetrics(); startMetrics(); }
  else                         stopMetrics();
}

// ── Create app form ───────────────────────────────
function toggleCreateForm() {
  var form = document.getElementById('create-app-form');
  var btn  = document.getElementById('btn-new-app');
  if (!form) return;
  var open = form.style.display !== 'none';
  form.style.display = open ? 'none' : '';
  if (btn) btn.textContent = open ? '+ New application' : '✕ Cancel';
}

function setSourceMode(mode) {
  sourceMode = mode;
  document.getElementById('source-github').style.display = mode === 'github' ? '' : 'none';
  document.getElementById('source-zip').style.display    = mode === 'zip'    ? '' : 'none';
  document.getElementById('tab-github').classList.toggle('is-active', mode === 'github');
  document.getElementById('tab-zip').classList.toggle('is-active',    mode === 'zip');
}

function handleZipSelect(input) {
  var label = document.getElementById('zip-drop-label');
  if (input.files && input.files[0]) {
    label.innerHTML = '<span class="zip-selected">' + esc(input.files[0].name) + '</span>';
  }
}

function handleZipDrop(event) {
  event.preventDefault();
  document.getElementById('zip-drop-zone').classList.remove('drag-over');
  var files = event.dataTransfer.files;
  if (!files || !files[0]) return;
  if (!files[0].name.toLowerCase().endsWith('.zip')) { showToast('Please drop a ZIP file'); return; }
  var zipInput = document.getElementById('app-zip');
  var dt = new DataTransfer();
  dt.items.add(files[0]);
  zipInput.files = dt.files;
  handleZipSelect(zipInput);
}

function submitCreateApp() {
  var name = (document.getElementById('app-name').value || '').trim();
  if (!name) name = 'demo-app-' + (State.getApps().length + 1);

  var repo = (document.getElementById('app-repo').value || '').trim();
  var source = { type: 'github', url: repo || 'https://github.com/demo/concreto-app' };
  if (sourceMode === 'zip') {
    var zipInput = document.getElementById('app-zip');
    var zipName = zipInput && zipInput.files && zipInput.files[0]
      ? zipInput.files[0].name
      : 'demo-project.zip';
    source = { type: 'zip', filename: zipName };
  }

  DemoData.createApplication({ name: name, source: source })
    .then(function() {
      document.getElementById('app-name').value = '';
      document.getElementById('app-repo').value = '';
      var zipInput = document.getElementById('app-zip');
      var zipLabel = document.getElementById('zip-drop-label');
      if (zipInput) zipInput.value = '';
      if (zipLabel) zipLabel.innerHTML = 'Drop ZIP here or <strong>click to browse</strong>';
      toggleCreateForm();
      renderApplications();
      showToast('Application "' + name + '" created');
    })
    .catch(function(err) {
      if (err.status === 401) { clearAuth(); window.location.href = 'login.html'; return; }
      showToast(err.message || 'Failed to create application');
    });
}

// ── Applications rendering ────────────────────────
function renderApplications() {
  var tbody = document.getElementById('apps-tbody');
  if (!tbody) return;

  Promise.all([DemoData.getApplications(), DemoData.getDeployments()])
    .then(function(results) {
      var apps = results[0];
      var deps = results[1];

      var lastDepMap = {};
      deps.forEach(function(d) {
        var existing = lastDepMap[d.application_id];
        if (!existing || new Date(d.created_at) > new Date(existing.created_at)) {
          lastDepMap[d.application_id] = d;
        }
      });
      Object.keys(_simState).forEach(function(depId) {
        var sim = _simState[depId];
        var existing = lastDepMap[sim.application_id];
        if (!existing || new Date(sim.created_at) >= new Date(existing.created_at)) {
          lastDepMap[sim.application_id] = sim;
        }
      });

      if (!apps.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="td-empty">No applications yet. Create your first one above.</td></tr>';
        return;
      }

      tbody.innerHTML = apps.map(function(app) {
        var last   = lastDepMap[app.id] || null;
        var status = last ? last.status : 'never';
        var inProg = last && (status === 'pending' || status === 'building' || status === 'deploying');
        var badgeCls  = status === 'running' ? 'status-live' :
                        status === 'failed'  ? 'status-failed' :
                        status === 'never'   ? 'status-idle' : 'status-building';
        var badgeText = status === 'running'  ? 'Running' :
                        status === 'failed'   ? 'Failed' :
                        status === 'never'    ? 'Not deployed' :
                        status === 'pending'  ? 'Pending' :
                        status === 'building' ? 'Building' : 'Deploying';
        var repoShort = (app.repository_url || '').replace(/^https?:\/\/(www\.)?github\.com\//, '');
        return '<tr>' +
          '<td><strong>' + esc(app.name) + '</strong></td>' +
          '<td class="td-mono" style="font-size:11px;">' + esc(repoShort) + '</td>' +
          '<td><span class="status-badge ' + badgeCls + '">' + badgeText + '</span></td>' +
          '<td class="td-mono">' + (last ? timeAgo(last.created_at) : '—') + '</td>' +
          '<td><button class="btn-deploy-sm" onclick="deployApp(\'' + app.id + '\')"' + (inProg ? ' disabled' : '') + '>Deploy</button></td>' +
          '</tr>';
      }).join('');
    })
    .catch(function(err) {
      if (err.status === 401) { clearAuth(); window.location.href = 'login.html'; return; }
      tbody.innerHTML = '<tr><td colspan="5" class="td-empty">Failed to load applications.</td></tr>';
    });
}

// ── Deploy ────────────────────────────────────────
function deployApp(appId) {
  DemoData.createDeployment(appId)
    .then(function(dep) {
      renderApplications();
      showView('deployments');
      setTimeout(function() { simulateDeploy(dep); }, 120);
    })
    .catch(function(err) {
      if (err.status === 401) { clearAuth(); window.location.href = 'login.html'; return; }
      showToast(err.message || 'Failed to create deployment');
    });
}

function simulateDeploy(dep) {
  var depId = dep.id;
  var step = 0;

  _simState[depId] = {
    id: depId,
    application_id: dep.application_id,
    status: 'pending',
    logs: [],
    created_at: dep.created_at
  };

  function tick() {
    if (step >= DEPLOY_STEPS.length) {
      DemoData.updateDeploymentStatus(depId, 'running').then(function() {
        delete _simState[depId];
        renderDeployments();
        renderApplications();
      });
      return;
    }
    var s = DEPLOY_STEPS[step];
    _simState[depId].status = s.status;
    _simState[depId].logs = (_simState[depId].logs || []).concat([s.log]);

    updateDeployProgress(s.pct, s.log, s.status);
    if (activeView === 'applications') renderApplications();
    step++;
    setTimeout(tick, 480 + Math.floor(Math.random() * 320));
  }

  tick();
}

function updateDeployProgress(pct, log, status) {
  var wrap    = document.getElementById('deploy-active-wrap');
  var fill    = document.getElementById('deploy-fill');
  var pctEl   = document.getElementById('deploy-pct');
  var titleEl = document.getElementById('deploy-title');
  var logEl   = document.getElementById('deploy-log');

  if (!wrap) return;
  wrap.style.display = '';

  if (fill)    fill.style.width = pct + '%';
  if (pctEl)   pctEl.textContent = pct + '%';
  if (titleEl) {
    titleEl.textContent =
      status === 'running'   ? 'Deployed' :
      status === 'deploying' ? 'Deploying to Kubernetes…' : 'Building…';
  }
  if (logEl) {
    var line = document.createElement('div');
    line.textContent = log;
    line.className = log.charAt(0) === '✔' ? 'log-line-ok' : 'log-line-dim';
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  if (pct === 100) {
    showToast('Deployment live');
    setTimeout(function() {
      if (wrap) wrap.style.display = 'none';
      if (logEl) logEl.innerHTML = '';
      if (fill)  fill.style.width = '0%';
    }, 4000);
  }
}

// ── Deployments rendering ─────────────────────────
function renderDeployments() {
  var tbody = document.getElementById('deps-tbody');
  if (!tbody) return;

  Promise.all([DemoData.getDeployments(), DemoData.getApplications()])
    .then(function(results) {
      var deps = results[0];
      var apps = results[1];

      var appMap = {};
      apps.forEach(function(a) { appMap[a.id] = a; });

      var allDeps = deps.slice();
      Object.keys(_simState).forEach(function(depId) {
        var sim = _simState[depId];
        var found = false;
        for (var i = 0; i < allDeps.length; i++) {
          if (allDeps[i].id === depId) { allDeps[i] = Object.assign({}, allDeps[i], sim); found = true; break; }
        }
        if (!found) allDeps.unshift(sim);
      });

      if (!allDeps.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="td-empty">No deployments yet. Deploy an application to get started.</td></tr>';
        return;
      }

      tbody.innerHTML = allDeps.map(function(dep) {
        var app = appMap[dep.application_id];
        var appName  = app ? app.name : 'Unknown';
        var badgeCls = dep.status === 'running' ? 'status-live' :
                       dep.status === 'failed'  ? 'status-failed' : 'status-building';
        var badgeText = dep.status.charAt(0).toUpperCase() + dep.status.slice(1);
        var lastLog = dep.logs && dep.logs.length ? dep.logs[dep.logs.length - 1] : '—';
        return '<tr>' +
          '<td><strong>' + esc(appName) + '</strong></td>' +
          '<td><span class="status-badge ' + badgeCls + '">' + badgeText + '</span></td>' +
          '<td class="td-mono">' + timeAgo(dep.created_at) + '</td>' +
          '<td class="td-mono" style="font-size:11px;color:var(--text-3);">' + esc(lastLog) + '</td>' +
          '</tr>';
      }).join('');
    })
    .catch(function(err) {
      if (err.status === 401) { clearAuth(); window.location.href = 'login.html'; return; }
      tbody.innerHTML = '<tr><td colspan="4" class="td-empty">Failed to load deployments.</td></tr>';
    });
}

// ── Metrics rendering ─────────────────────────────
function renderMetrics() {
  var container = document.getElementById('metrics-container');
  if (!container) return;

  DemoData.getApplications()
    .then(function(apps) {
      if (!apps.length) {
        container.innerHTML = '<div class="td-empty" style="grid-column:1/-1;padding:48px;">No applications yet. Create an application first.</div>';
        return;
      }

      return DemoData.getDeployments().then(function(deps) {
        var lastDepMap = {};
        deps.forEach(function(d) {
          var existing = lastDepMap[d.application_id];
          if (!existing || new Date(d.created_at) > new Date(existing.created_at)) {
            lastDepMap[d.application_id] = d;
          }
        });

        container.innerHTML = apps.map(function(app) {
          var last      = lastDepMap[app.id] || null;
          var isRunning = last && last.status === 'running';
          return '<div class="metric-card">' +
            '<div class="metric-card-header">' +
              '<div class="metric-app-name">' + esc(app.name) + '</div>' +
              '<span class="status-badge ' + (isRunning ? 'status-live' : 'status-idle') + '">' + (isRunning ? 'Running' : 'Idle') + '</span>' +
            '</div>' +
            '<div class="metric-row">' +
              '<div class="metric-item">' +
                '<div class="metric-label">CPU</div>' +
                '<div class="metric-value" id="cpu-' + app.id + '">' + (isRunning ? rnd(10, 80) + '%' : '—') + '</div>' +
              '</div>' +
              '<div class="metric-item">' +
                '<div class="metric-label">Memory</div>' +
                '<div class="metric-value" id="mem-' + app.id + '">' + (isRunning ? rnd(100, 500) + ' MB' : '—') + '</div>' +
              '</div>' +
              '<div class="metric-item">' +
                '<div class="metric-label">Req/s</div>' +
                '<div class="metric-value" id="rps-' + app.id + '">' + (isRunning ? rnd(10, 200) : '—') + '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('');
      });
    })
    .catch(function(err) {
      if (err.status === 401) { clearAuth(); window.location.href = 'login.html'; return; }
    });
}

function updateMetrics() {
  DemoData.getApplications().then(function(apps) {
    return DemoData.getDeployments().then(function(deps) {
      var lastDepMap = {};
      deps.forEach(function(d) {
        var existing = lastDepMap[d.application_id];
        if (!existing || new Date(d.created_at) > new Date(existing.created_at)) {
          lastDepMap[d.application_id] = d;
        }
      });
      apps.forEach(function(app) {
        var last      = lastDepMap[app.id] || null;
        var isRunning = last && last.status === 'running';
        var cpuEl = document.getElementById('cpu-' + app.id);
        var memEl = document.getElementById('mem-' + app.id);
        var rpsEl = document.getElementById('rps-' + app.id);
        if (cpuEl) cpuEl.textContent = isRunning ? rnd(10, 80)   + '%'  : '—';
        if (memEl) memEl.textContent = isRunning ? rnd(100, 500) + ' MB' : '—';
        if (rpsEl) rpsEl.textContent = isRunning ? rnd(10, 200)           : '—';
      });
    });
  });
}

function startMetrics() { stopMetrics(); metricsInterval = setInterval(updateMetrics, 2000); }
function stopMetrics()  { if (metricsInterval) { clearInterval(metricsInterval); metricsInterval = null; } }

// ── Helpers ───────────────────────────────────────
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function rnd(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function timeAgo(iso) {
  var diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'Just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}

// ── Init ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {
  if (!isLoggedIn()) { window.location.href = 'login.html'; return; }
  showView('applications');
});
