import { escapeHtml, formatDate } from './data.js';

export function renderVoter(state, session, refs) {
  const voter = state.voters.find((item) => item.id === session.voterId);
  const { voterElectionTitle, voterElectionDate, voterStatus, voterCandidateList, castVoteBtn, votedMessage, sessionLabel, endVotingBtn, feedbackPanel, feedbackForm, feedbackMessage } = refs;

  voterElectionTitle.textContent = state.election.title;
  voterElectionDate.textContent = `Closing date: ${formatDate(state.election.date)}`;
  sessionLabel.textContent = `Signed in as: ${session.label}`;

  voterStatus.textContent = state.election.open ? 'Voting open' : 'Voting closed';
  voterStatus.classList.toggle('status-open', state.election.open);
  voterStatus.classList.toggle('status-closed', !state.election.open);

  const hasVoted = Boolean(voter?.voted);
  castVoteBtn.disabled = hasVoted || !state.election.open;
  endVotingBtn.disabled = state.election.open;
  votedMessage.classList.toggle('hidden', !hasVoted);
  const hasFeedback = state.feedback.some((item) => item.voterId === session.voterId);
  feedbackPanel.classList.toggle('hidden', !hasVoted);
  feedbackForm.classList.toggle('hidden', hasFeedback);
  feedbackMessage.classList.toggle('hidden', !hasFeedback);
  if (hasFeedback) {
    feedbackMessage.textContent = 'Thank you for sharing your feedback.';
  }

  voterCandidateList.innerHTML = state.candidates
    .map((candidate) => {
      const selected = refs.selectedCandidate === candidate.id;
      return `
        <article class="voter-candidate-card ${selected ? 'selected' : ''}" data-voter-candidate="${candidate.id}">
          <img src="${escapeHtml(candidate.image)}" alt="${escapeHtml(candidate.name)}" />
          <div class="voter-candidate-body">
            <h3>${escapeHtml(candidate.name)}</h3>
            <p>${escapeHtml(candidate.description)}</p>
            <label class="radio-row">
              <input type="radio" name="candidate" ${selected ? 'checked' : ''} ${hasVoted || !state.election.open ? 'disabled' : ''} />
              <span>Select</span>
            </label>
          </div>
        </article>
      `;
    })
    .join('');
}

export function bindVoter({ state, app, saveState, renderApp, refs }) {
  const { voterCandidateList, castVoteBtn, voterMessage, endVotingBtn, feedbackForm, feedbackRating, feedbackText, feedbackMessage } = refs;

  voterCandidateList.addEventListener('click', (event) => {
    const card = event.target.closest('[data-voter-candidate]');
    if (!card || !state.election.open) {
      return;
    }

    const voter = state.voters.find((item) => item.id === app.session?.voterId);
    if (voter?.voted) {
      return;
    }

    refs.selectedCandidate = card.dataset.voterCandidate;
    renderApp();
  });

  castVoteBtn.addEventListener('click', () => {
    const voter = state.voters.find((item) => item.id === app.session?.voterId);
    if (!refs.selectedCandidate) {
      voterMessage.textContent = 'Please select a candidate before casting your vote.';
      voterMessage.classList.remove('hidden');
      return;
    }

    if (!voter || voter.voted || !state.election.open) {
      voterMessage.textContent = 'This ballot is no longer available.';
      voterMessage.classList.remove('hidden');
      return;
    }

    state.votes.push(refs.selectedCandidate);
    voter.voted = true;
    saveState(state);
    refs.voterMessage.classList.add('hidden');
    renderApp();
  });

  feedbackForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const voterId = app.session?.voterId;
    if (!voterId || state.feedback.some((item) => item.voterId === voterId)) {
      return;
    }

    state.feedback.push({
      voterId,
      rating: Number(feedbackRating.value),
      message: feedbackText.value.trim(),
      submittedAt: new Date().toISOString(),
    });
    saveState(state);
    feedbackForm.reset();
    feedbackMessage.textContent = 'Thank you for sharing your feedback.';
    feedbackMessage.classList.remove('hidden');
    feedbackForm.classList.add('hidden');
  });

  endVotingBtn.addEventListener('click', () => {
    refs.passwordModal.classList.remove('hidden');
    refs.passwordModal.setAttribute('aria-hidden', 'false');
    refs.modalPassword.focus();
    refs.modalError.classList.add('hidden');
  });
}
