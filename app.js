import { loadState, saveState } from './modules/data.js';
import { bindAuth } from './modules/auth.js';
import { bindAdmin, renderAdmin } from './modules/admin.js';
import { bindVoter, renderVoter } from './modules/voter.js';

const app = {
  state: loadState(),
  session: null,
  selectedCandidate: null,
  showProfile: false,
  showAdminLogin: false,
};

const refs = {
  authView: document.getElementById('authView'),
  adminLoginView: document.getElementById('adminLoginView'),
  profileView: document.getElementById('profileView'),
  adminView: document.getElementById('adminView'),
  voterView: document.getElementById('voterView'),
  logoutBtn: document.getElementById('logoutBtn'),
  profileBtn: document.getElementById('profileBtn'),
  profileBackBtn: document.getElementById('profileBackBtn'),
  profileAvatar: document.getElementById('profileAvatar'),
  profileName: document.getElementById('profileName'),
  profileRole: document.getElementById('profileRole'),
  profileId: document.getElementById('profileId'),
  profileStatus: document.getElementById('profileStatus'),
  authTabs: document.querySelectorAll('[data-auth-tab]'),
  loginForm: document.getElementById('loginForm'),
  registerForm: document.getElementById('registerForm'),
  loginError: document.getElementById('loginError'),
  registerError: document.getElementById('registerError'),
  loginId: document.getElementById('loginId'),
  loginPassword: document.getElementById('loginPassword'),
  adminLoginForm: document.getElementById('adminLoginForm'),
  adminLoginId: document.getElementById('adminLoginId'),
  adminLoginPassword: document.getElementById('adminLoginPassword'),
  adminLoginError: document.getElementById('adminLoginError'),
  adminLoginLink: document.getElementById('adminLoginLink'),
  voterLoginLink: document.getElementById('voterLoginLink'),
  registerName: document.getElementById('registerName'),
  registerId: document.getElementById('registerId'),
  registerPassword: document.getElementById('registerPassword'),
  electionTitle: document.getElementById('electionTitle'),
  electionDate: document.getElementById('electionDate'),
  adminStatusBadge: document.getElementById('adminStatusBadge'),
  totalVotes: document.getElementById('totalVotes'),
  registeredCount: document.getElementById('registeredCount'),
  winnerName: document.getElementById('winnerName'),
  addCandidateBtn: document.getElementById('addCandidateBtn'),
  addCandidateForm: document.getElementById('addCandidateForm'),
  cancelCandidateBtn: document.getElementById('cancelCandidateBtn'),
  newCandidateName: document.getElementById('newCandidateName'),
  newCandidateDescription: document.getElementById('newCandidateDescription'),
  newCandidateImage: document.getElementById('newCandidateImage'),
  adminCandidateList: document.getElementById('adminCandidateList'),
  settingsForm: document.getElementById('settingsForm'),
  settingsMessage: document.getElementById('settingsMessage'),
  adminResults: document.getElementById('adminResults'),
  voterElectionTitle: document.getElementById('voterElectionTitle'),
  voterElectionDate: document.getElementById('voterElectionDate'),
  voterStatus: document.getElementById('voterStatus'),
  sessionLabel: document.getElementById('sessionLabel'),
  voterCandidateList: document.getElementById('voterCandidateList'),
  castVoteBtn: document.getElementById('castVoteBtn'),
  endVotingBtn: document.getElementById('endVotingBtn'),
  voterMessage: document.getElementById('voterMessage'),
  votedMessage: document.getElementById('votedMessage'),
  feedbackPanel: document.getElementById('feedbackPanel'),
  feedbackForm: document.getElementById('feedbackForm'),
  feedbackRating: document.getElementById('feedbackRating'),
  feedbackText: document.getElementById('feedbackText'),
  feedbackMessage: document.getElementById('feedbackMessage'),
  passwordModal: document.getElementById('passwordModal'),
  modalPassword: document.getElementById('modalPassword'),
  modalConfirm: document.getElementById('modalConfirm'),
  modalError: document.getElementById('modalError'),
  modalCloseButtons: document.querySelectorAll('[data-close-modal]'),
  selectedCandidate: null,
};

function renderApp() {
  const isAdmin = app.session?.role === 'admin';
  const isVoter = app.session?.role === 'voter';

  refs.authView.classList.toggle('hidden', Boolean(app.session) || app.showAdminLogin);
  refs.adminLoginView.classList.toggle('hidden', Boolean(app.session) || !app.showAdminLogin);
  refs.profileView.classList.toggle('hidden', !app.session || !app.showProfile);
  refs.adminView.classList.toggle('hidden', !isAdmin || app.showProfile);
  refs.voterView.classList.toggle('hidden', !isVoter || app.showProfile);
  refs.profileBtn.classList.toggle('hidden', !app.session);
  refs.logoutBtn.classList.toggle('hidden', !app.session);
  refs.sessionLabel.textContent = app.session ? `Signed in as: ${app.session.label}` : 'No active session';

  if (app.session) {
    const voter = app.state.voters.find((item) => item.id === app.session.voterId);
    const profileName = app.session.label || 'SecureVote user';
    refs.profileAvatar.textContent = profileName.slice(0, 2).toUpperCase();
    refs.profileName.textContent = profileName;
    refs.profileRole.textContent = isAdmin ? 'Administrator account' : 'Registered voter';
    refs.profileId.textContent = isAdmin ? 'admin' : app.session.voterId;
    refs.profileStatus.textContent = isAdmin ? 'Active' : voter?.voted ? 'Vote submitted' : 'Ready to vote';
  }

  if (isAdmin) {
    renderAdmin(app.state, refs);
  }

  if (isVoter) {
    renderVoter(app.state, app.session, refs);
  }
}

function setSession(nextSession) {
  app.session = nextSession;
  app.showProfile = false;
  app.showAdminLogin = false;
  refs.selectedCandidate = null;
  renderApp();
}

bindAuth({
  state: app.state,
  setSession,
  renderApp,
  refs,
});

bindAdmin({
  state: app.state,
  saveState,
  renderApp,
  refs,
});

bindVoter({
  state: app.state,
  app,
  saveState,
  renderApp,
  refs,
});

refs.logoutBtn.addEventListener('click', () => {
  setSession(null);
});

refs.adminLoginLink.addEventListener('click', () => {
  app.showAdminLogin = true;
  renderApp();
});

refs.voterLoginLink.addEventListener('click', () => {
  app.showAdminLogin = false;
  renderApp();
});

refs.profileBtn.addEventListener('click', () => {
  app.showProfile = true;
  renderApp();
});

refs.profileBackBtn.addEventListener('click', () => {
  app.showProfile = false;
  renderApp();
});

renderApp();
