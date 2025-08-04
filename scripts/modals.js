const priorityModal = document.getElementById('priority-modal');
const deadlineModal = document.getElementById('deadline-modal');
const deadlineInput = document.getElementById('deadline-input');
const confirmDeadlineBtn = document.getElementById('confirm-deadline');
const cancelDeadlineBtn = document.getElementById('cancel-deadline');
const cancelPriorityBtn = document.getElementById('cancel-priority');
const priorityButtons = document.querySelectorAll('.priority-btn');

priorityButtons.forEach(btn => {
  btn.onclick = () => {
    tempTask.priority = btn.dataset.priority;
    priorityModal.classList.add('hidden');
    deadlineInput.value = '';
    deadlineModal.classList.remove('hidden');
  };
});

cancelPriorityBtn.onclick = () => {
  priorityModal.classList.add('hidden');
};

confirmDeadlineBtn.onclick = async () => {
  if (!deadlineInput.value) {
    await openAlertModal('Escolha uma data ou cancele.');
    return;
  }
  tempTask.deadline = deadlineInput.value;
  const folder = getFolderByPath(currentFolderPath);
  if (!folder) return;
  folder.tasks.push({
    text: tempTask.text,
    done: false,
    priority: tempTask.priority,
    deadline: tempTask.deadline
  });
  inputTask.value = '';
  deadlineModal.classList.add('hidden');
  saveToLocalStorage();
  renderTasks();
};

cancelDeadlineBtn.onclick = () => {
  deadlineModal.classList.add('hidden');
};

function openInputModal(title, defaultValue = '') {
  return new Promise(resolve => {
    const modal = document.getElementById('input-modal');
    const titleEl = document.getElementById('input-modal-title');
    const inputEl = document.getElementById('input-modal-text');
    const okBtn = document.getElementById('input-modal-ok');
    const cancelBtn = document.getElementById('input-modal-cancel');
    titleEl.textContent = title;
    inputEl.value = defaultValue;
    modal.classList.remove('hidden');
    inputEl.focus();

    function cleanup() {
      okBtn.onclick = null;
      cancelBtn.onclick = null;
    }

    okBtn.onclick = () => {
      cleanup();
      modal.classList.add('hidden');
      resolve(inputEl.value.trim());
    };

    cancelBtn.onclick = () => {
      cleanup();
      modal.classList.add('hidden');
      resolve(null);
    };
  });
}

function openAlertModal(message) {
  return new Promise(resolve => {
    const modal = document.getElementById('alert-modal');
    const messageEl = document.getElementById('alert-modal-message');
    const okBtn = document.getElementById('alert-modal-ok');
    messageEl.textContent = message;
    modal.classList.remove('hidden');
    okBtn.onclick = () => {
      modal.classList.add('hidden');
      resolve();
    };
  });
}
