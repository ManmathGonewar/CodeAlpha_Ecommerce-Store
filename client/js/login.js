import { api, getAuth, setAuth } from './api.js';
import { clearInlineMessage, setButtonLoading, showInlineMessage } from './ui.js';

const form = document.getElementById('login-form');
const feedback = document.getElementById('login-feedback');

if (getAuth()?.token) {
  window.location.href = './products.html';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearInlineMessage(feedback);

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    setButtonLoading(submitButton, true, 'Logging in...');

    const response = await api.login({ email, password });
    setAuth({ token: response.token, user: response.user });

    const redirect = new URLSearchParams(window.location.search).get('redirect');
    window.location.href = redirect || './products.html';
  } catch (error) {
    let errorMsg = error.message || 'Unable to log you in right now.';
    if (error.details && error.details.length > 0) {
      errorMsg = error.details.map(d => d.message).join('. ');
    }
    showInlineMessage(
      feedback,
      errorMsg,
      'error'
    );
  } finally {
    setButtonLoading(submitButton, false);
  }
});
