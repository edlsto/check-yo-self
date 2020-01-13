var addTaskButton = document.querySelector('.add');
var addTaskInput = document.querySelector('.task-item-input');
var cardsSection = document.querySelector('.cards');
var clearBtn = document.querySelector('.clear-all');
var dropDownBtn = document.querySelector('.drop-down-btn');
var dropDownContent = document.querySelector('.dropdown-content')
var filterUrgentBtn = document.querySelector('.urgency');
var makeTaskList = document.querySelector('.make-task-list');
var newTaskInput = document.querySelector('.new-task-input')
var searchInput = document.querySelector('.search-input');
var taskListContainer = document.querySelector('.task-list-inner');
var tasks = [];
var taskTitleInput = document.querySelector('.dashboard-input');
var filterOptions = document.querySelectorAll('.filter-option');

dropDownContent.addEventListener('click', function() {
  advancedFilter();
  filterCards();
})


addTaskButton.addEventListener('click', addTask);
addTaskInput.addEventListener('keyup', validateTaskInput)
cardsSection.addEventListener('click', function(){
  deleteCard(event);
  checkOffTask(event);
  makeUrgent(event);
})
cardsSection.addEventListener('keypress', function(){
  editContent(event);
  addTaskInCard(event);
})
clearBtn.addEventListener('click', resetTasks)
dropDownBtn.addEventListener('click', showMenu)
filterUrgentBtn.addEventListener('click', function() {
  toggleDisplayUrgentCards();
  filterCards();
  checkNoUrgentItems()
})
makeTaskList.addEventListener('click', createTaskList)
taskListContainer.addEventListener('click', function(){
  removeTaskFromDrafts(event);
});
searchInput.addEventListener('keyup', filterCards)
taskTitleInput.addEventListener('keyup', validateMakeTaskList)
window.addEventListener("resize", resizeAllGridItems);

loadCards();

setTimeout(function(){
  resizeAllGridItems();
}, 30);

function activateDeleteBtn(matchedTaskList) {
  var deleteBtn = event.target.closest('.content').nextElementSibling.firstElementChild.nextElementSibling;
  if (validateDelete(matchedTaskList)) {
    deleteBtn.classList.add('active')
  } else {
    deleteBtn.classList.remove('active')
  };
}

function addTask() {
  var task = new Task(addTaskInput.value);
  tasks.push(task);
  taskListContainer.innerHTML +=
  `<li><img src="./assets/delete.svg" class="delete-task">${task.text}</li>`
  addTaskInput.value = '';
  addTaskButton.setAttribute('disabled', 'disabled');
  validateMakeTaskList();
}

function addTaskInCard(e) {
  var regex = /[^\s-]/
  if (e.target.classList.contains('new-task-input') && e.key === 'Enter' && regex.test(e.target.value)) {
    var li = document.createElement("li");
    li.setAttribute('contenteditable', 'true');
    li.setAttribute('class', 'card-task-item');
    var task = new Task(e.target.value);
    var matchedTaskList = matchTaskList(event);
    matchedTaskList.tasks.push(task)
    li.innerHTML = `<img src="./assets/checkbox.svg" class="checkbox" id="${task.id}"><p>${e.target.value}</p>`
    e.target.parentElement.firstElementChild.nextElementSibling.appendChild(li);
    e.target.value = '';
    resizeAllGridItems();
    matchedTaskList.updateToDo();
  }
}

function advancedFilter() {
  if(event.target.classList.contains('filter-option')) {
    filterOptions.forEach(function(option){
      option.classList.remove('active-search')
    })
    event.target.classList.add('active-search')
    searchInput.placeholder = event.target.innerText;
    event.target.parentElement.classList.remove('show')
  }

}

function checkForEmpty() {
  var allTaskLists = getAllSavedTasks();
  var urgentTaskList = allTaskLists.filter(function(task) {
    return task.urgent
  });
  if (allTaskLists.length === 0){
    cardsSection.classList.add('empty');
    cardsSection.innerHTML = `<h3>Create a to-do!</h3>`;
    filterUrgentBtn.setAttribute('disabled', 'disabled');
  } else {
    cardsSection.classList.remove('empty');
    filterUrgentBtn.removeAttribute('disabled');
  }
}

function checkForTaskMatch (taskList) {
  var matched = false;
  for (var i = 0; i < taskList.tasks.length; i++){
    if (taskList.tasks[i].text.toLowerCase().includes(searchInput.value.toLowerCase())) {
      matched = true;
    }
  }
  return matched;
}

function checkNoUrgentItems() {
  if (cardsSection.innerHTML === '') {
    cardsSection.classList.add('empty');
    cardsSection.innerHTML = `<h3>No urgent to-dos</h3>`;
  } else {
    cardsSection.classList.remove('empty');
  }
}

function checkOffTask(event) {
  if (event.target.classList.contains('checkbox')) {
    toggleCheck();
    var matchedTaskList = matchTaskList(event)
    var matchedTask = matchedTaskList.tasks.filter(function(task) {
      return parseInt(event.target.id) === task.id;
    })[0]
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done = !matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done
    matchedTaskList.updateTask(event.target.id);
    activateDeleteBtn(matchedTaskList);
  }
}

function createTaskList() {
  var taskList = new ToDoList(taskTitleInput.value, tasks);
  taskList.saveToStorage();
  resetTasks();
  loadCards();
  resizeAllGridItems();
  validateMakeTaskList();
  clearBtn.setAttribute('disabled', 'disabled');
}

function deleteCard(e) {
  if (e.target.parentElement.classList.contains('card-delete-icon') && e.target.parentElement.classList.contains('active')) {
    var selectedCard = e.target.parentElement.parentElement.parentElement;
    selectedCard.remove()
    var allTaskLists = getAllSavedTasks();
    allTaskLists.forEach(function(taskList, i){
      if (taskList.id === parseInt(selectedCard.id)) {
        taskList.deleteFromStorage();
      }
    })
    allTaskLists = getAllSavedTasks();
    checkForEmpty();
  }
}

function editContent(e) {
  if ((e.target.classList.contains('card-title')
  || e.target.classList.contains('card-task-item-text'))
   && e.key === 'Enter') {
    var matchedTaskList = matchTaskList(event)
    makeEdits(e, matchedTaskList)
    e.preventDefault();
    e.target.blur();
  }
}

function filterByTitle(task) {
  return task.title.toLowerCase().includes(searchInput.value.toLowerCase())
}

function filterByTitleAndTask(taskList) {
  var matched = false;
  for (var i = 0; i < taskList.tasks.length; i++){
    if (taskList.tasks[i].text.toLowerCase().includes(searchInput.value.toLowerCase())) {
      matched = true;
    }
    if (taskList.title.toLowerCase().includes(searchInput.value.toLowerCase())) {
      matched = true;
    }
  }
  return matched;
}

function filterCards() {
  var allTaskLists = getAllSavedTasks();
  if (searchInput.placeholder === 'Filter by task') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(checkForTaskMatch)))
  } else if (searchInput.placeholder === 'Filter by title') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(filterByTitle)))
  } else if (searchInput.placeholder === 'Search all') {
    renderAndResizeCards(filterUrgentSearch(allTaskLists.filter(filterByTitleAndTask)))
  }
}

function filterUrgentSearch(list){
  if (filterUrgentBtn.classList.contains('active')){
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

function loadCards() {
  var allTaskLists = getAllSavedTasks();
  cardsSection.innerHTML = renderCardsHTML(allTaskLists);
  checkForEmpty(allTaskLists);
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

function makeTaskListHTML(taskList) {
  var taskListHTML = '';
  for (var i = 0; i < taskList.tasks.length; i++) {
    var task = taskList.tasks[i].text;
    var html = `<li class="card-task-item${taskList.tasks[i].done === false ? '' : ' checked'}"><img src="./assets/${taskList.tasks[i].done === false ? 'checkbox' : 'checkbox-active'}.svg" class="checkbox" id="${taskList.tasks[i].id}"><p contenteditable="true" class="card-task-item-text">${task}</p></li>`
    taskListHTML += html;
  }
  return taskListHTML;
}

function makeUrgent(e) {
  if (e.target.parentElement.classList.contains('card-urgent-icon')) {
    var card = e.target.parentElement.parentElement.parentElement
    var matchedTaskList = matchTaskList(event)
    toggleUrgent(card, matchedTaskList);
    matchedTaskList.updateToDo();
  }
}

function matchTaskList(event) {
  var cardId = parseInt(event.target.closest('.card').id);
  return getAllSavedTasks().filter(taskList => taskList.id === cardId)[0];
}

function reinstantiateAllTasksList(allTaskLists) {
  var allTaskListsWithMethods = [];
  allTaskLists.forEach(function(taskList){
    allTaskListsWithMethods.push(new ToDoList(taskList.title, taskList.tasks, taskList.id, taskList.urgent));
  })
  return allTaskListsWithMethods;
}

function removeTaskFromDrafts(e) {
  if (e.target.classList.contains('delete-task')) {
    removeTaskFromDraftModeStorage(e);
    e.target.parentNode.remove();
  };
  validateMakeTaskList()
}

function removeTaskFromDraftModeStorage(e) {
  tasks.forEach(function(task, i){
    if (e.target.parentElement.innerText === task.text) {
      tasks.splice(i, 1)
    };
  });
}

function renderCardsHTML(allTaskLists) {
  var cardsHTML = ''
  for (var i = allTaskLists.length - 1; i >= 0; i--){
    cardsHTML +=
    `<div class="card${allTaskLists[i].urgent ? ' urgent-card' : ''}" id="${allTaskLists[i].id}">
      <div class="content">
        <h2 contenteditable="true" class="card-title">${allTaskLists[i].title}</h2>
          <ul>
            ${makeTaskListHTML(allTaskLists[i])}
          </ul>
          <input class="new-task-input" placeholder="Add new task"></input>
          </div>
          <div class="icon-row">
            <div class="card-urgent-icon">
              <img src="./assets/urgent.svg">
              <p>Urgent</p>
            </div>
            <div class="card-delete-icon${validateDelete(allTaskLists[i]) ? ' active' : ''}">
              <img src="./assets/delete.svg">
              <p>Delete</p>
            </div>
          </div>
    </div>`
  }
  return cardsHTML;
}

function renderAndResizeCards(allTaskLists) {
  cardsSection.innerHTML = renderCardsHTML(allTaskLists);
  resizeAllGridItems();
}

function resetTasks() {
  taskTitleInput.value = '';
  tasks = [];
  taskListContainer.innerHTML = '';
}

function resizeAllGridItems(){
  var allItems = document.querySelectorAll(".card");
  for (var i = 0; i < allItems.length; i++) {
    resizeGridItem(allItems[i]);
  }
}

function resizeGridItem(item){
  rowHeight = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap+70)/(rowHeight+rowGap));
  item.style.gridRowEnd = "span "+rowSpan;
}

function showMenu() {
  dropDownContent.classList.toggle('show')
}

function toggleCheck() {
  if (event.target.parentElement.classList.contains('checked')) {
    event.target.parentElement.classList.remove('checked');
    event.target.src = './assets/checkbox.svg';
  } else {
    event.target.parentElement.classList.add('checked')
    event.target.src = './assets/checkbox-active.svg';
  }
}

function toggleDisplayUrgentCards() {
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

function toggleUrgent(card, matchedTaskList) {
  if (card.classList.contains('urgent-card')) {
    card.classList.remove('urgent-card')
  } else {
    card.classList.add('urgent-card')
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

function validateMakeTaskList() {
  if (tasks.length > 0 && taskTitleInput.value !== '') {
    makeTaskList.removeAttribute('disabled')
  } else {
    makeTaskList.setAttribute('disabled', 'disabled');
  }
  if (tasks.length > 0 || taskTitleInput.value !== '') {
    clearBtn.removeAttribute('disabled')
  }
}

function validateTaskInput() {
  if (addTaskInput.value !== '') {
    addTaskButton.removeAttribute('disabled');
  } else {
    addTaskButton.setAttribute('disabled', 'disabled');
  }
}
