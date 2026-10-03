import { escapeHtml, formatDate } from './data.js';

export function renderAdmin(state, refs) {
  const { electionTitle, electionDate, adminStatusBadge, totalVotes, registeredCount, winnerName, adminCandidateList, adminResults } = refs;

  electionTitle.value = state.election.title;
  electionDate.value = state.election.date;
  adminStatusBadge.textContent = state.election.open ? 'Voting open' : 'Voting closed';
  adminStatusBadge.classList.toggle('status-open', state.election.open);
  adminStatusBadge.classList.toggle('status-closed', !state.election.open);

  totalVotes.textContent = String(state.votes.length);
  registeredCount.textContent = String(state.voters.length);

  const counts = getCounts(state);
  const totalCount = Object.values(counts).reduce((sum, item) => sum + item, 0);
  const maxVotes = Math.max(...Object.values(counts), 0);
  const winner = state.candidates.find((candidate) => counts[candidate.id] === maxVotes && maxVotes > 0);

  winnerName.textContent = winner ? winner.name : 'Awaiting votes';

  adminCandidateList.innerHTML = state.candidates
    .map(
      (candidate) => `
        <article class="admin-candidate-item">
          <img src="${escapeHtml(candidate.image)}" alt="${escapeHtml(candidate.name)}" />
          <div class="admin-candidate-body">
            <input data-candidate-name="${candidate.id}" value="${escapeHtml(candidate.name)}" aria-label="Candidate name" />
            <textarea data-candidate-description="${candidate.id}" rows="3" aria-label="Candidate description">${escapeHtml(candidate.description)}</textarea>
            <input data-candidate-image="${candidate.id}" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload candidate image" />
            <div class="inline-actions">
              <button type="button" class="mini-button" data-save-candidate="${candidate.id}">Save</button>
              <button type="button" class="mini-button danger-mini" data-remove-candidate="${candidate.id}">Remove</button>
            </div>
          </div>
        </article>
      `,
    )
    .join('');

  adminResults.innerHTML = state.candidates
    .map((candidate) => {
      const count = counts[candidate.id] || 0;
      const percent = totalCount ? Math.round((count / totalCount) * 100) : 0;

      return `
        <div class="result-item">
          <div class="result-header">
            <span>${escapeHtml(candidate.name)}</span>
            <span>${count} vote${count === 1 ? '' : 's'} · ${percent}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" style="width: ${percent}%"></div>
          </div>
        </div>
      `;
    })
    .join('');
}

export function bindAdmin({ state, saveState, renderApp, refs }) {
  const { settingsForm, addCandidateBtn, addCandidateForm, cancelCandidateBtn, newCandidateName, newCandidateDescription, newCandidateImage, adminCandidateList, endVotingBtn, modalConfirm, modalPassword, modalError, passwordModal, modalCloseButtons } = refs;

  settingsForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const { electionTitle, electionDate } = refs;
    state.election.title = electionTitle.value.trim() || 'Community Board Election';
    state.election.date = electionDate.value;
    saveState(state);
    refs.settingsMessage.textContent = 'Election settings saved successfully.';
    refs.settingsMessage.classList.remove('hidden');
    refs.settingsMessage.classList.add('success');
    renderApp();
  });

  addCandidateBtn.addEventListener('click', () => {
    addCandidateForm.classList.toggle('hidden');
    if (!addCandidateForm.classList.contains('hidden')) {
      newCandidateName.focus();
    }
  });

  cancelCandidateBtn.addEventListener('click', () => {
    addCandidateForm.reset();
    addCandidateForm.classList.add('hidden');
  });

  addCandidateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = newCandidateName.value.trim();
    const description = newCandidateDescription.value.trim();
    const imageFile = newCandidateImage.files[0];

    if (!imageFile || !imageFile.type.startsWith('image/')) {
      newCandidateImage.setCustomValidity('Please upload a candidate image.');
      newCandidateImage.reportValidity();
      return;
    }

    newCandidateImage.setCustomValidity('');
    const image = await readImageFile(imageFile);

    state.candidates.push({
      id: `c${Date.now()}`,
      name,
      description,
      image,
    });
    addCandidateForm.reset();
    addCandidateForm.classList.add('hidden');
    saveState(state);
    renderApp();
  });

  adminCandidateList.addEventListener('click', async (event) => {
    const saveId = event.target.dataset.saveCandidate;
    const removeId = event.target.dataset.removeCandidate;

    if (saveId) {
      const candidate = state.candidates.find((item) => item.id === saveId);
      if (!candidate) {
        return;
      }

      const nameField = document.querySelector(`[data-candidate-name="${saveId}"]`);
      const descField = document.querySelector(`[data-candidate-description="${saveId}"]`);
      const imageField = document.querySelector(`[data-candidate-image="${saveId}"]`);
      candidate.name = nameField.value.trim() || candidate.name;
      candidate.description = descField.value.trim() || candidate.description;
      if (imageField.files[0]) {
        candidate.image = await readImageFile(imageField.files[0]);
      }
      saveState(state);
      renderApp();
    }

    if (removeId && window.confirm('Remove this candidate from the election?')) {
      state.candidates = state.candidates.filter((candidate) => candidate.id !== removeId);
      state.votes = state.votes.filter((vote) => vote !== removeId);
      saveState(state);
      renderApp();
    }
  });

  modalConfirm.addEventListener('click', () => {
    const password = modalPassword.value;
    if (password !== 'admin123') {
      refs.modalError.textContent = 'Incorrect administrator password.';
      refs.modalError.classList.remove('hidden');
      return;
    }

    state.election.open = false;
    saveState(state);
    passwordModal.classList.add('hidden');
    passwordModal.setAttribute('aria-hidden', 'true');
    modalPassword.value = '';
    renderApp();
  });

  modalCloseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      passwordModal.classList.add('hidden');
      passwordModal.setAttribute('aria-hidden', 'true');
      modalPassword.value = '';
      refs.modalError.classList.add('hidden');
    });
  });

  passwordModal.addEventListener('click', (event) => {
    if (event.target === passwordModal) {
      passwordModal.classList.add('hidden');
      passwordModal.setAttribute('aria-hidden', 'true');
      modalPassword.value = '';
      refs.modalError.classList.add('hidden');
    }
  });

  modalPassword.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      modalConfirm.click();
    }
  });

  endVotingBtn.addEventListener('click', () => {
    passwordModal.classList.remove('hidden');
    passwordModal.setAttribute('aria-hidden', 'false');
    modalPassword.focus();
    refs.modalError.classList.add('hidden');
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function getCounts(state) {
  return state.candidates.reduce((counts, candidate) => {
    counts[candidate.id] = state.votes.filter((vote) => vote === candidate.id).length;
    return counts;
  }, {});
}
