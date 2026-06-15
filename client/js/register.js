import { api, getAuth, setAuth } from './api.js';
import { clearInlineMessage, setButtonLoading, showInlineMessage } from './ui.js';

const form = document.getElementById('register-form');
const feedback = document.getElementById('register-feedback');

if (getAuth()?.token) {
  window.location.href = './products.html';
}

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearInlineMessage(feedback);

  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password')
  };
  const confirmPassword = formData.get('confirmPassword');

  if (payload.password !== confirmPassword) {
    showInlineMessage(feedback, 'Passwords do not match.', 'error');
    return;
  }

  try {
    setButtonLoading(submitButton, true, 'Creating account...');

    const response = await api.register(payload);
    setAuth({ token: response.token, user: response.user });
    window.location.href = './products.html';
  } catch (error) {
    let errorMsg = error.message || 'Unable to create your account right now.';
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
