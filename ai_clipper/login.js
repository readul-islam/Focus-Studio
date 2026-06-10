// Login page functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Check if already logged in
  const isAuth = await api.isAuthenticated();
  if (isAuth) {
    window.location.href = 'popup.html';
    return;
  }

  const loginForm = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // Validate inputs
    if (!email || !password) {
      showError('Please enter both email and password');
      return;
    }

    // Show loading state
    loginBtn.classList.add('loading');
    hideError();

    try {
      // Call login API
      await api.login(email, password);

      // Success - redirect to popup
      window.location.href = 'popup.html';
    } catch (error) {
      // Show error
      showError(error.message || 'Login failed. Please check your credentials.');
      loginBtn.classList.remove('loading');
    }
  });

  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
  }

  function hideError() {
    errorMessage.classList.remove('show');
  }
});
