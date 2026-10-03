export function bindAuth({
  state,
  setSession,
  renderApp,
  refs,
}) {
  const { loginForm, registerForm, adminLoginForm, loginError, registerError, adminLoginError, loginId, loginPassword, adminLoginId, adminLoginPassword, registerName, registerId, registerPassword } = refs;

  refs.authTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      refs.authTabs.forEach((item) => item.classList.toggle('active', item === tab));
      const mode = tab.dataset.authTab;
      loginForm.classList.toggle('hidden', mode !== 'login');
      registerForm.classList.toggle('hidden', mode !== 'register');
    });
  });

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage(loginError);

    const voterId = loginId.value.trim();
    const password = loginPassword.value;

    const voter = state.voters.find((item) => item.id.toLowerCase() === voterId.toLowerCase() && item.password === password);
    if (!voter) {
      showMessage(loginError, 'Those details did not match any registered voter.', 'error');
      return;
    }

    setSession({ role: 'voter', voterId: voter.id, label: voter.name });
    loginForm.reset();
    renderApp();
  });

  adminLoginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage(adminLoginError);

    if (adminLoginId.value.trim().toLowerCase() !== 'admin' || adminLoginPassword.value !== 'admin123') {
      showMessage(adminLoginError, 'Incorrect administrator credentials.', 'error');
      return;
    }

    adminLoginForm.reset();
    setSession({ role: 'admin', label: 'Administrator' });
    renderApp();
  });

  registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearMessage(registerError);

    const name = registerName.value.trim();
    const voterId = registerId.value.trim();
    const password = registerPassword.value;

    if (!name || !voterId || password.length < 4) {
      showMessage(registerError, 'Please provide a name, voter ID card number, and a password of at least 4 characters.', 'error');
      return;
    }

    const duplicate = state.voters.some((voter) => voter.id.toLowerCase() === voterId.toLowerCase());
    if (duplicate) {
      showMessage(registerError, 'That voter ID is already registered.', 'error');
      return;
    }

    state.voters.push({ name, id: voterId, password, voted: false });
    registerForm.reset();
    refs.authTabs[0].click();
    showMessage(loginError, 'Account created successfully. You can sign in now.', 'success');
  });
}

function showMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove('hidden');
  element.classList.toggle('error', type === 'error');
  element.classList.toggle('success', type === 'success');
}

function clearMessage(element) {
  element.textContent = '';
  element.classList.add('hidden');
}
