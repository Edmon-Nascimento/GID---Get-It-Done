let folders = [];
let currentFolderPath = [];
let currentFilter = 'all';

const folderList = document.getElementById('folder-list');
const taskTitle = document.getElementById('task-title');
const taskForm = document.getElementById('task-form');
const inputTask = document.getElementById('input-task');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task');
const newFolderBtn = document.getElementById('new-folder');
const filterButtons = document.querySelectorAll('.filter');

let tempTask = { text: '', priority: '', deadline: '' };

function saveToLocalStorage() {
  localStorage.setItem('pomodoroFolders', JSON.stringify(folders));
}

function loadFromLocalStorage() {
  const savedData = localStorage.getItem('pomodoroFolders');
  if (savedData) folders = JSON.parse(savedData);
}

function arraysEqual(a, b) {
  return a.length === b.length && a.every((val, i) => val === b[i]);
}

function getFolderByPath(path) {
  let current = folders;
  for (let i = 0; i < path.length; i++) {
    if (!current) return null;
    if (i === path.length - 1) return current[path[i]];
    current = current[path[i]].subfolders;
  }
  return null;
}

function getParentFolderByPath(path) {
  if (path.length <= 1) return null;
  return getFolderByPath(path.slice(0, -1));
}

function renderFolders() {
  folderList.innerHTML = '';
  folders.forEach((folder, i) => {
    folderList.appendChild(createFolderItem(folder, [i]));
  });
}

function createFolderItem(folder, path) {
  const li = document.createElement('li');
  li.classList.add('folder-item');
  if (arraysEqual(currentFolderPath, path)) li.classList.add('active');

  const toggle = document.createElement('span');
  toggle.className = 'folder-toggle';
  toggle.innerHTML = `<i class="fa-solid fa-chevron-right"></i>`;
  toggle.onclick = e => {
    e.stopPropagation();
    const sub = li.querySelector('ul.subfolders');
    if (sub) {
      sub.classList.toggle('open');
      toggle.classList.toggle('open');
    }
  };

  const folderName = document.createElement('span');
  folderName.className = 'folder-name';
  folderName.textContent = folder.name;
  folderName.onclick = () => {
    currentFolderPath = [...path];
    renderFolders();
    renderTasks();
  };

  const actions = document.createElement('div');
  actions.className = 'actions';

  const addSub = document.createElement('i');
  addSub.className = 'fa-solid fa-folder-plus';
  addSub.title = 'Adicionar subpasta';
  addSub.onclick = async e => {
    e.stopPropagation();
    await addSubfolder(path);
  };

  const edit = document.createElement('i');
  edit.className = 'fa-solid fa-pen';
  edit.title = 'Renomear';
  edit.onclick = async e => {
    e.stopPropagation();
    await renameFolder(folder, path);
  };

  const del = document.createElement('i');
  del.className = 'fa-solid fa-trash';
  del.title = 'Excluir pasta';
  del.onclick = e => {
    e.stopPropagation();
    if (!confirm(`Excluir a pasta "${folder.name}"?`)) return;
    let parent = getParentFolderByPath(path);
    let siblings = parent ? parent.subfolders : folders;
    siblings.splice(siblings.indexOf(folder), 1);
    if (arraysEqual(currentFolderPath, path)) {
      currentFolderPath = [];
      taskTitle.textContent = 'Selecione uma pasta';
      taskForm.style.display = 'none';
      taskList.innerHTML = '';
    }
    saveToLocalStorage();
    renderFolders();
    renderTasks();
  };

  actions.append(addSub, edit, del);

  const folderRow = document.createElement('div');
  folderRow.className = 'folder-row';
  folderRow.append(toggle, folderName, actions);
  li.appendChild(folderRow);

  if (folder.subfolders && folder.subfolders.length > 0) {
    const subUl = document.createElement('ul');
    subUl.className = 'subfolders';
    folder.subfolders.forEach((sf, idx) => {
      subUl.appendChild(createFolderItem(sf, [...path, idx]));
    });
    li.appendChild(subUl);
  }

  return li;
}

function renderTasks() {
  const folder = getFolderByPath(currentFolderPath);
  if (!folder) {
    taskTitle.textContent = 'Selecione uma pasta';
    taskForm.style.display = 'none';
    taskList.innerHTML = '';
    return;
  }
  taskTitle.textContent = "Pasta: "+folder.name;
  taskForm.style.display = 'flex';
  taskList.innerHTML = '';

  let rendered = false;
  folder.tasks.forEach((task, i) => {
    if ((currentFilter === 'pending' && task.done) || (currentFilter === 'done' && !task.done)) return;

    const li = document.createElement('li');
    li.className = `priority-${task.priority} ${task.done ? 'completed' : ''}`;

    const spanName = document.createElement('span');
    spanName.textContent = task.text;
    spanName.className = 'task-name';
    spanName.style.flex = '1';

    const deadline = document.createElement('span');
    deadline.className = 'task-deadline';
    deadline.textContent = task.deadline ? `(até ${task.deadline})` : '';

    const actions = document.createElement('div');
    actions.className = 'actions';

    const toggleDone = document.createElement('i');
    toggleDone.className = `fa-solid fa-check${task.done ? '' : ' fa-fade'}`;
    toggleDone.title = 'Concluir';
    toggleDone.onclick = () => {
      task.done = !task.done;
      saveToLocalStorage();
      renderTasks();
    };

    const rename = document.createElement('i');
    rename.className = 'fa-solid fa-pen-to-square';
    rename.title = 'Renomear tarefa';
    rename.style.marginLeft = '10px';
    rename.onclick = e => {
      e.stopPropagation();
      renameTask(folder, task);
    };

    const del = document.createElement('i');
    del.className = 'fa-solid fa-trash';
    del.title = 'Excluir tarefa';
    del.onclick = () => {
      folder.tasks.splice(i, 1);
      saveToLocalStorage();
      renderTasks();
    };

    actions.append(toggleDone, rename, del);
    li.append(spanName, deadline, actions);
    taskList.appendChild(li);
    rendered = true;
  });
  if (!rendered) {
    const li = document.createElement('li');
    li.textContent = 'Nenhuma tarefa encontrada.';
    li.className = 'no-task';
    taskList.appendChild(li);
  }
}

addTaskBtn.onclick = () => startAddTask();
inputTask.addEventListener('keydown', e => {
  if (e.key === 'Enter') startAddTask();
});

async function startAddTask() {
  const text = inputTask.value.trim();
  if (!text) return openAlertModal('Digite a tarefa.');
  const folder = getFolderByPath(currentFolderPath);
  if (!folder) return openAlertModal('Selecione uma pasta.');
  tempTask.text = text;
  tempTask.priority = '';
  tempTask.deadline = '';
  priorityModal.classList.remove('hidden');
}

async function renameTask(folder, task) {
  const newText = await openInputModal('Renomear tarefa:', task.text);
  if (!newText) return;
  task.text = newText;
  saveToLocalStorage();
  renderTasks();
}

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    renderTasks();
  };
});

newFolderBtn.onclick = async () => {
  const name = await openInputModal('Nome da nova pasta:');
  if (!name) return;
  if (folders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    await openAlertModal('Já existe essa pasta.');
    return;
  }
  folders.push({ name, tasks: [], subfolders: [] });
  saveToLocalStorage();
  renderFolders();
};

async function addSubfolder(path) {
  const name = await openInputModal('Nome da nova subpasta:');
  if (!name) return;
  let parent = getFolderByPath(path);
  if (!parent.subfolders) parent.subfolders = [];
  if (parent.subfolders.some(f => f.name.toLowerCase() === name.toLowerCase())) {
    await openAlertModal('Já existe essa subpasta.');
    return;
  }
  parent.subfolders.push({ name, tasks: [], subfolders: [] });
  saveToLocalStorage();
  renderFolders();
}

async function renameFolder(folder, path) {
  const newName = await openInputModal('Renomear pasta:', folder.name);
  if (!newName) return;
  let parent = getParentFolderByPath(path);
  let siblings = parent ? parent.subfolders : folders;
  if (siblings.some(f => f.name.toLowerCase() === newName.toLowerCase() && f !== folder)) {
    await openAlertModal('Já existe uma pasta com esse nome.');
    return;
  }
  folder.name = newName;
  saveToLocalStorage();
  renderFolders();
}

loadFromLocalStorage();
renderFolders();
renderTasks();
