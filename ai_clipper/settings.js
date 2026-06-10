// Settings page functionality
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  const isAuth = await api.isAuthenticated();
  if (!isAuth) {
    window.location.href = 'login.html';
    return;
  }

  // Load user profile
  await loadUserProfile();

  initializeUI();
});

async function loadUserProfile() {
  try {
    const result = await chrome.storage.local.get(['user']);
    const user = result.user;

    if (user) {
      // Update UI with user info
      const authStatus = document.getElementById('authStatus');
      const authID = document.getElementById('authID');
      authStatus.textContent = `${user.name}`;
      authID.textContent = `${user.email}`;

      // Display studio name
      const studioName = document.getElementById('studioName');
      if (user.studio && user.studio.name) {
        studioName.textContent = user.studio.name;
      }
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

function initializeUI() {
  const backBtn = document.getElementById('backBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  // Back button
  backBtn.addEventListener('click', () => {
    window.location.href = 'popup.html';
  });

  // Logout button
  logoutBtn.addEventListener('click', handleLogout);
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    try {
      // Clear tokens
      await api.logout();

      // Redirect to login
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
      alert('Failed to logout. Please try again.');
    }
  }
}
