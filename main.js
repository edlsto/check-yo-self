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
addTaskInput.addEventListener('keyup', validateAddTaskBtn)
cardsSection.addEventListener('click', function(e) {
  deleteCard(e);
  checkOffTask(e);
  makeUrgent(e);
  renderUrgent(e);
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
taskTitleInput.addEventListener('keyup', validateMakeTaskListBtn);
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
  var task = new Task(addTaskInput.value);
  tasks.push(task);
  taskListContainer.innerHTML +=
  `<li><img src="./assets/delete.svg" class="delete-task">${task.text}</li>`
  addTaskInput.value = '';
  addTaskButton.setAttribute('disabled', 'disabled');
  validateMakeTaskListBtn();
}

function addTaskInCard(e) {
  if (e.target.classList.contains('new-task-input') && e.key === 'Enter' && /[^\s-]/.test(e.target.value)) {
    var task = new Task(e.target.value);
    var matchedTaskList = matchTaskList(e)
    matchedTaskList.tasks.push(task)
    e.target.previousElementSibling.innerHTML += `<li class="card-task-item"><img src="./assets/checkbox.svg" class="checkbox" id="${task.id}"><p contenteditable="true" class="card-task-item-text">${e.target.value}</p></li>`
    e.target.value = '';
    resizeAllGridItems();
    matchedTaskList.updateToDo();
  }
}

function changeSearchType(e) {
  if (e.target.classList.contains('filter-option')) {
    filterOptions.forEach(function(option) {
      option.classList.remove('active-search');
    });
    e.target.classList.add('active-search');
    searchInput.placeholder = e.target.innerText;
    e.target.parentElement.classList.remove('show');
  }
}

function checkOffTask(e) {
  if (e.target.classList.contains('checkbox')) {
    toggleCheckDOM(e);
    var matchedTaskList = matchTaskList(e)
    var matchedTask = matchedTaskList.tasks.filter(function(task) {
      return parseInt(e.target.id) === task.id;
    })[0]
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done = !matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done
    matchedTaskList.updateTask(e.target.id);
    activateDeleteBtn(matchedTaskList, e);
  }
}

function createEmptyMsg(allTaskLists) {
  var message;
  if (allTaskLists.length === 0) {
    message = 'Create a to-do!'
  }
  if (filterUrgentBtn.classList.contains('active')) {
    message = 'No urgent to-dos';
  }
  if (searchInput.value !== '') {
    message = 'No search results';
  }
  return message;
}

function createTaskList() {
  var taskList = new ToDoList(taskTitleInput.value, tasks);
  taskList.saveToStorage();
  resetTasks();
  loadCards();
  resizeAllGridItems();
  validateMakeTaskListBtn();
  clearBtn.setAttribute('disabled', 'disabled');
}

function deleteCard(e) {
  if (e.target.parentElement.classList.contains('card-delete-icon') && e.target.parentElement.classList.contains('active')) {
    e.target.closest('.card').remove()
    var allTaskLists = getAllSavedTasks();
    var matchedTaskList = matchTaskList(e)
    matchedTaskList.deleteFromStorage();
    allTaskLists.splice(allTaskLists.indexOf(matchedTaskList), 1);
    renderEmptyMsg(allTaskLists);
    validateFilterUrgentBtn(allTaskLists);
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
  return taskList.tasks.some(function(task) {
    return task.text.toLowerCase().includes(searchInput.value.toLowerCase());
  });
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
    list = list.filter(function(task) {
      return task.urgent
    })
  }
  return list;
}

function getAllSavedTasks() {
  var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
  allTaskLists = reinstantiateAllTasksList(allTaskLists);
  return allTaskLists;
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
  var allTaskLists = getAllSavedTasks();
  renderCardsHTML(allTaskLists);
  renderEmptyMsg(allTaskLists);
  validateFilterUrgentBtn(allTaskLists);
}

function matchTask(e, matchedTaskList) {
  var taskId = parseInt(e.target.parentElement.firstElementChild.id);
  return matchedTaskList.tasks.filter(function(task) {
    return taskId === task.id;
  })[0]
}

function makeEdits(e, matchedTaskList) {
  if (e.target.classList.contains('card-title')) {
    matchedTaskList.title = e.target.innerText;
    matchedTaskList.updateToDo();
  } else if (e.target.classList.contains('card-task-item-text')) {
    var matchedTask = matchTask(e, matchedTaskList);
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].text = e.target.innerText;
    matchedTaskList.updateTask(parseInt(e.target.parentElement.firstElementChild.id));
  }
}

function makeUrgent(e) {
  if (e.target.parentElement.classList.contains('card-urgent-icon')) {
    var card = e.target.parentElement.parentElement.parentElement
    var matchedTaskList = matchTaskList(e)
    toggleUrgentData(card, matchedTaskList, e);
    matchedTaskList.updateToDo();
  }
}

function matchTaskList(e) {
  var cardId = parseInt(e.target.closest('.card').id);
  return getAllSavedTasks().filter(taskList => taskList.id === cardId)[0];
}

function reinstantiateAllTasksList(allTaskLists) {
  var allTaskListsWithMethods = [];
  allTaskLists.forEach(function(taskList) {
    allTaskListsWithMethods.push(new ToDoList(taskList.title, taskList.tasks, taskList.id, taskList.urgent));
  })
  return allTaskListsWithMethods;
}

function removeTaskFromDrafts(e) {
  if (e.target.classList.contains('delete-task')) {
    removeTaskFromDraftModeData(e);
    e.target.parentNode.remove();
  }
  validateMakeTaskListBtn();
}

function removeTaskFromDraftModeData(e) {
  tasks.forEach(function(task, i) {
    if (e.target.parentElement.innerText === task.text) {
      tasks.splice(i, 1);
    }
  });
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
  allTaskLists[i].tasks.forEach(function(task) {
    var taskClone = document.importNode(document.querySelector('#task-item').content, true);
    hydrateTask(taskClone, task);
    clone.querySelector('ul').appendChild(taskClone);
  });
}

function renderUrgent(e) {
  if (e.target.parentElement.classList.contains('card-urgent-icon') && filterUrgentBtn.classList.contains('active')) {
    var allTaskLists = getAllSavedTasks();
    var urgentTaskList = allTaskLists.filter(function(task) {
      return task.urgent;
    });
    renderAndResizeCards(urgentTaskList);
    renderEmptyMsg(allTaskLists);
  }
}

function resetTasks() {
  taskTitleInput.value = '';
  tasks = [];
  taskListContainer.innerHTML = '';
}

function resizeAllGridItems() {
  var allItems = document.querySelectorAll(".card");
  allItems.forEach(function(item) {
    resizeGridItem(item);
  });
}

function resizeGridItem(item) {
  var rowHeight = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-auto-rows'));
  var rowGap = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-row-gap'));
  var rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap + 70) / (rowHeight + rowGap));
  item.style.gridRowEnd = "span " + rowSpan;
}

function showMenu() {
  dropDownContent.classList.toggle('show')
}

function toggleCheckDOM(e) {
  if (e.target.parentElement.classList.contains('checked')) {
    e.target.parentElement.classList.remove('checked');
    e.target.src = './assets/checkbox.svg';
  } else {
    e.target.parentElement.classList.add('checked')
    e.target.src = './assets/checkbox-active.svg';
  }
}

function toggleUrgentCardsDOM() {
  filterUrgentBtn.classList.toggle('active');
  var allTaskLists = getAllSavedTasks();
  var urgentTaskList = allTaskLists.filter(function(task) {
    return task.urgent
  })
  if (filterUrgentBtn.classList.contains('active')) {
    renderAndResizeCards(urgentTaskList)
  } else {
    cardsSection.classList.remove('empty');
    renderAndResizeCards(allTaskLists)
  }
}

function toggleUrgentData(card, matchedTaskList, e) {
  console.log()

  if (card.classList.contains('urgent-card')) {
    card.classList.remove('urgent-card')
    e.target.parentElement.firstElementChild.src = 'assets/urgent.svg'
  } else {
    card.classList.add('urgent-card')
    e.target.parentElement.firstElementChild.src = 'assets/urgent-active.svg'
  }
  if (matchedTaskList.urgent === false) {
    matchedTaskList.urgent = true;
  } else {
    matchedTaskList.urgent = false;
  }
}

function validateDelete(taskList) {
  var validated = true;
  taskList.tasks.forEach(function(task) {
    if (task.done === false) {
      validated = false;
    }
  })
  return validated;
}

function validateAddTaskBtn() {
  if (addTaskInput.value !== '') {
    addTaskButton.removeAttribute('disabled');
  } else {
    addTaskButton.setAttribute('disabled', 'disabled');
  }
}

function validateFilterUrgentBtn(allTaskLists) {
  if (allTaskLists.length > 0) {
    filterUrgentBtn.removeAttribute('disabled');
  } else {
    filterUrgentBtn.setAttribute('disabled', 'disabled');
  }
}

function validateMakeTaskListBtn() {
  if (tasks.length > 0 && taskTitleInput.value !== '') {
    makeTaskList.removeAttribute('disabled')
  } else {
    makeTaskList.setAttribute('disabled', 'disabled');
  }
  if (tasks.length > 0 || taskTitleInput.value !== '') {
    clearBtn.removeAttribute('disabled')
  }
}
