function authToast(message) {
  if (typeof showToast === 'function') {
    showToast(message);
    return;
  }
  var toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() { toast.classList.remove('show'); }, 3000);
}

function authText(key, fallback) {
  return typeof t === 'function' ? t(key) : fallback;
}

function saveAuth(token, user) {
  if (typeof setAuth === 'function') {
    setAuth(token, user);
    return;
  }
  localStorage.setItem('ph_token', token);
  localStorage.setItem('ph_user', JSON.stringify(user));
}

window.handleLogin = function() {
  var email = (document.getElementById('login-email').value || '').trim();
  var password = document.getElementById('login-pass').value || '';
  if (!email) {
    authToast(authText('toast_email_required', 'Email is required'));
    return;
  }
  if (!password) {
    authToast(authText('toast_password_required', 'Password is required'));
    return;
  }
  Api.login(email, password)
    .then(function(result) {
      saveAuth(result.token, result.user);
      window.location.href = 'dashboard.html';
    })
    .catch(function(err) {
      authToast(err.message || 'Sign in failed');
    });
};

window.handleRegister = function() {
  var name = (document.getElementById('register-name').value || '').trim();
  var email = (document.getElementById('register-email').value || '').trim();
  var password = document.getElementById('register-pass').value || '';
  if (!name) {
    authToast(authText('toast_name_required', 'Name is required'));
    return;
  }
  if (!email) {
    authToast(authText('toast_email_required', 'Email is required'));
    return;
  }
  if (password.length < 8) {
    authToast(authText('toast_password_min', 'Password must be at least 8 characters'));
    return;
  }
  Api.register(name, email, password)
    .then(function(result) {
      saveAuth(result.token, result.user);
      window.location.href = 'dashboard.html';
    })
    .catch(function(err) {
      authToast(err.message || 'Account creation failed');
    });
};
