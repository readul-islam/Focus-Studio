// Login page functionality
document.addEventListener('DOMContentLoaded', async () => {
  const isAuth = await api.isAuthenticated();
  if (isAuth) {
    window.location.href = 'popup.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const errorMessage = document.getElementById('errorMessage');
  const passwordGroup = document.getElementById('passwordGroup');
  const twoFactorGroup = document.getElementById('twoFactorGroup');
  const backToLoginBtn = document.getElementById('backToLoginBtn');
  const subtitle = document.getElementById('subtitle');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const totpInput = document.getElementById('totpCode');

  let is2faMode = false;
  let pending2faEmail = '';

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    if (is2faMode) {
      await handleVerify2fa();
      return;
    }

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const result = await api.login(email, password);

      if (result.requires_2fa) {
        pending2faEmail = result.email || email;
        enter2faMode(pending2faEmail);
        return;
      }

      window.location.href = 'popup.html';
    } catch (error) {
      showError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  });

  backToLoginBtn.addEventListener('click', () => {
    exit2faMode();
  });

  async function handleVerify2fa() {
    const code = totpInput.value.trim();
    if (!code) {
      showError('Enter your authentication code');
      return;
    }

    setLoading(true);

    try {
      await api.verify2fa(pending2faEmail, code);
      window.location.href = 'popup.html';
    } catch (error) {
      showError(error.message || 'Invalid code. Try again.');
    } finally {
      setLoading(false);
    }
  }

  function enter2faMode(email) {
    is2faMode = true;
    pending2faEmail = email;
    emailInput.value = email;
    emailInput.readOnly = true;
    passwordGroup.classList.add('hidden');
    passwordInput.required = false;
    twoFactorGroup.classList.remove('hidden');
    totpInput.required = true;
    totpInput.value = '';
    loginBtnText.textContent = 'Verify';
    backToLoginBtn.classList.remove('hidden');
    subtitle.textContent = 'Enter the 6-digit code from your authenticator app';
    totpInput.focus();
  }

  function exit2faMode() {
    is2faMode = false;
    pending2faEmail = '';
    emailInput.readOnly = false;
    passwordGroup.classList.remove('hidden');
    passwordInput.required = true;
    twoFactorGroup.classList.add('hidden');
    totpInput.required = false;
    totpInput.value = '';
    loginBtnText.textContent = 'Sign In';
    backToLoginBtn.classList.add('hidden');
    subtitle.textContent = 'Sign in to start clipping products to Focuspilot';
    hideError();
  }

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }

  function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
  }

  function setLoading(loading) {
    loginBtn.classList.toggle('loading', loading);
  }
});
