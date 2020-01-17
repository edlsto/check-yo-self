var addTaskButton = document.querySelector('.add');
var addTaskInput = document.querySelector('.task-item-input');
var cardsSection = document.querySelector('.cards');
var clearBtn = document.querySelector('.clear-all');
var dropDownBtn = document.querySelector('.drop-down-btn');
var dropDownContent = document.querySelector('.dropdown-content');
var filterOptions = document.querySelectorAll('.filter-option');
var filterUrgentBtn = document.querySelector('.urgency');
var makeTaskList = document.querySelector('.make-task-list');
var searchInput = document.querySelector('.search-input');
var taskListContainer = document.querySelector('.task-list-inner');
var tasks = [];
var taskTitleInput = document.querySelector('.dashboard-input');

addTaskButton.addEventListener('click', addTaskDraftMode);
addTaskInput.addEventListener('keyup', function(e) {
  validateBtn(addTaskButton, addTaskInput.value !== '')
})
cardsSection.addEventListener('click', function(e) {
  deleteCard(e);
  checkOffTask(e);
  makeUrgent(e);
});
cardsSection.addEventListener('keypress', function(e) {
  editContent(e);
  addTaskInCard(e);
});
clearBtn.addEventListener('click', resetTasks)
dropDownBtn.addEventListener('click', showMenu)
dropDownContent.addEventListener('click', function(e) {
  changeSearchType(e);
  filterCards();
});
filterUrgentBtn.addEventListener('click', function(e) {
  toggleUrgentCardsDOM(e);
  filterCards();
});
makeTaskList.addEventListener('click', createTaskList);
searchInput.addEventListener('keyup', filterCards);
taskListContainer.addEventListener('click', function(e) {
  removeTaskFromDrafts(e);
});
taskTitleInput.addEventListener('keyup', function(e){
  validateBtn(makeTaskList, tasks.length > 0 && taskTitleInput.value !== '');
  validateBtn(clearBtn, tasks.length > 0 || taskTitleInput.value !== '')
});
window.addEventListener("resize", resizeAllGridItems);

loadCards();

setTimeout(function() {
  resizeAllGridItems();
}, 30);

function activateDeleteBtn(matchedTaskList, e) {
  var deleteBtn = e.target.closest('.card').querySelector('.card-delete-icon');
  if (validateDelete(matchedTaskList)) {
    deleteBtn.classList.add('active')
  } else {
    deleteBtn.classList.remove('active')
  }
}

function addTaskDraftMode() {
  var task = new Task(addTaskInput.value)
  tasks.push(task);
  taskListContainer.innerHTML +=
  `<li><img src="./assets/delete.svg" class="delete-task">${task.text}</li>`
  addTaskInput.value = '';
  addTaskButton.setAttribute('disabled', 'disabled');
  validateBtn(makeTaskList, tasks.length > 0 && taskTitleInput.value !== '');
  validateBtn(clearBtn, tasks.length > 0 || taskTitleInput.value !== '')
}

function addTaskInCard(e) {
  if (e.target.classList.contains('new-task-input') && e.key === 'Enter' && /[^\s-]/.test(e.target.value)) {
    var matchedTaskList = matchTaskList(e);
    matchedTaskList.tasks.push(new Task(e.target.value));
    matchedTaskList.updateToDo();
    renderAndResizeCards(getAllSavedTasks());
  }
}

function changeSearchType(e) {
  if (e.target.classList.contains('filter-option')) {
    searchInput.placeholder = e.target.innerText;
    e.target.parentElement.classList.remove('show');
  }
}

function checkOffTask(e) {
  if (e.target.classList.contains('checkbox')) {
    var matchedTaskList = matchTaskList(e)
    var matchedTask = matchedTaskList.tasks.filter(task => parseInt(e.target.id) === task.id)[0]
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done = !matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done
    matchedTaskList.updateTask(e.target.id);
    renderAndResizeCards(getAllSavedTasks());
    activateDeleteBtn(matchedTaskList, e);
  }
}

function createEmptyMsg(allTaskLists) {
  var message = allTaskLists.length === 0 ? 'Create a to-do!' : '';
  message = filterUrgentBtn.classList.contains('active') ? 'No urgent to-dos' : message;
  message = searchInput.value !== '' ? 'No search results' : message;
  return message;
}

function createTaskList() {
  new ToDoList(taskTitleInput.value, tasks).saveToStorage();
  resetTasks();
  loadCards();
  resizeAllGridItems();
  validateBtn(makeTaskList, tasks.length > 0 && taskTitleInput.value !== '');
  validateBtn(clearBtn, tasks.length > 0 || taskTitleInput.value !== '')
  clearBtn.setAttribute('disabled', 'disabled');
}

function deleteCard(e) {
  if (e.target.parentElement.classList.contains('card-delete-icon') && e.target.parentElement.classList.contains('active')) {
    var allTaskLists = getAllSavedTasks();
    matchTaskList(e).deleteFromStorage();
    allTaskLists.splice(allTaskLists.indexOf(matchTaskList(e)), 1);
    renderEmptyMsg(allTaskLists);
    validateBtn(filterUrgentBtn, allTaskLists.length > 0)
    renderAndResizeCards(allTaskLists);
  }
}

function editContent(e) {
  if ((e.target.classList.contains('card-title')
  || e.target.classList.contains('card-task-item-text'))
   && e.key === 'Enter') {
    makeEdits(e, matchTaskList(e))
    e.preventDefault();
    e.target.blur();
  }
}

function filterByTask(taskList) {
  return taskList.tasks.some(task => task.text.toLowerCase().includes(searchInput.value.toLowerCase()));
}

function filterByTitle(task) {
  return task.title.toLowerCase().includes(searchInput.value.toLowerCase());
}

function filterByTitleAndTask(taskList) {
  return filterByTask(taskList) || filterByTitle(taskList)
}

function filterCards() {
  var allTaskLists = getAllSavedTasks();
  if (searchInput.placeholder === 'Filter by task') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(filterByTask)))
  } else if (searchInput.placeholder === 'Filter by title') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(filterByTitle)))
  } else if (searchInput.placeholder === 'Search all') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(filterByTitleAndTask)))
  }
  renderEmptyMsg(allTaskLists)
}

function filterUrgentSearch(list) {
  if (filterUrgentBtn.classList.contains('active')) {
    list = list.filter(task => task.urgent)
  }
  return list;
}

function getAllSavedTasks() {
  return (JSON.parse(localStorage.getItem('allTaskLists')) || []).map(taskList => new ToDoList(taskList.title, taskList.tasks, taskList.id, taskList.urgent));
}

function hydrateCardClone(cardClone, allTaskLists, i) {
  if (allTaskLists[i].urgent) {
    cardClone.querySelector('.card').classList.add('urgent-card')
    cardClone.querySelector('.card-urgent-icon img').setAttribute('src', './assets/urgent-active.svg');
  }
  if (validateDelete(allTaskLists[i])) {
    cardClone.querySelector('.card-delete-icon').classList.add('active')
  }
  cardClone.querySelector('.card').id = allTaskLists[i].id
  cardClone.querySelector('.card-title').textContent = allTaskLists[i].title;
}

function hydrateTask(taskClone, task) {
  taskClone.querySelector('p').textContent = task.text;
  if (task.done === false) {
    taskClone.querySelector('img').setAttribute('src', './assets/checkbox.svg')
  } else {
    taskClone.querySelector('li').classList.add('checked');
    taskClone.querySelector('img').setAttribute('src', './assets/checkbox-active.svg');
  }
  taskClone.querySelector('img').id = task.id;
}

function loadCards() {
  renderCardsHTML(getAllSavedTasks());
  renderEmptyMsg(getAllSavedTasks());
  validateBtn(filterUrgentBtn, getAllSavedTasks().length > 0);
}

function matchTask(e, matchedTaskList) {
  return matchedTaskList.tasks.filter(task => parseInt(e.target.parentElement.firstElementChild.id) === task.id)[0];
}

function makeEdits(e, matchedTaskList) {
  if (e.target.classList.contains('card-title')) {
    matchedTaskList.title = e.target.innerText;
    matchedTaskList.updateToDo();
  } else if (e.target.classList.contains('card-task-item-text')) {
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchTask(e, matchedTaskList))].text = e.target.innerText;
    matchedTaskList.updateTask(parseInt(e.target.parentElement.firstElementChild.id));
  }
}

function makeUrgent(e) {
  if (e.target.parentElement.classList.contains('card-urgent-icon')) {
    var matchedTaskList = matchTaskList(e)
    matchedTaskList.urgent = !matchedTaskList.urgent;
    matchedTaskList.updateToDo();
    renderAndResizeCards(getAllSavedTasks());
  }
}

function matchTaskList(e) {
  return getAllSavedTasks().filter(taskList => taskList.id === parseInt(e.target.closest('.card').id))[0];
}

function removeTaskFromDrafts(e) {
  if (e.target.classList.contains('delete-task')) {
    removeTaskFromDraftModeData(e);
    e.target.parentNode.remove();
  }
  validateBtn(makeTaskList, tasks.length > 0 && taskTitleInput.value !== '');
  validateBtn(clearBtn, tasks.length > 0 || taskTitleInput.value !== '');
}

function removeTaskFromDraftModeData(e) {
  return tasks.filter((task, i) => e.target.parentElement.innerText !== task.text
  );
}

function renderAndResizeCards(allTaskLists) {
  renderCardsHTML(allTaskLists);
  resizeAllGridItems();
}

function renderCardsHTML(allTaskLists) {
  cardsSection.innerHTML = '';
  for (var i = allTaskLists.length - 1; i >= 0; i--) {
    var cardClone = document.importNode(document.querySelector('#task-card').content, true);
    hydrateCardClone(cardClone, allTaskLists, i);
    renderTasksHTML(allTaskLists, i, cardClone);
    cardsSection.appendChild(cardClone);
  }
}

function renderEmptyMsg(allTaskLists) {
  var renderedMsg = createEmptyMsg(allTaskLists);
  if (cardsSection.firstElementChild === null) {
    cardsSection.classList.add('empty');
    cardsSection.innerHTML = `<h3>${renderedMsg}</h3>`;
  } else {
    cardsSection.classList.remove('empty');
  }
}

function renderTasksHTML(allTaskLists, i, clone) {
  allTaskLists[i].tasks.forEach(task => {
    var taskClone = document.importNode(document.querySelector('#task-item').content, true);
    hydrateTask(taskClone, task);
    clone.querySelector('ul').appendChild(taskClone);
  });
}

function resetTasks() {
  taskTitleInput.value = '';
  tasks = [];
  taskListContainer.innerHTML = '';
}

function resizeAllGridItems() {
  var allItems = document.querySelectorAll(".card");
  allItems.forEach(item => resizeGridItem(item));
}

function resizeGridItem(item) {
  var rowHeight = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-auto-rows'));
  var rowGap = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-row-gap'));
  var rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap + 70) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;
}

function showMenu() {
  dropDownContent.classList.toggle('show');
}

function toggleUrgentCardsDOM() {
  filterUrgentBtn.classList.toggle('active');
  if (filterUrgentBtn.classList.contains('active')) {
    renderAndResizeCards(getAllSavedTasks().filter(task => task.urgent))
  } else {
    cardsSection.classList.remove('empty');
    renderAndResizeCards(getAllSavedTasks())
  }
}

function validateBtn(btn, condition) {
  if (condition) {
    btn.removeAttribute('disabled');
  } else {
    btn.setAttribute('disabled', 'disabled')
  }
}

function validateDelete(taskList) {
  return taskList.tasks.every(task => task.done);
}
