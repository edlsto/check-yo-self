var tasks = [];
var addTaskButton = document.querySelector('.add');
var addTaskInput = document.querySelector('.task-item-input');
var taskListContainer = document.querySelector('.task-list-inner');
var makeTaskList = document.querySelector('.make-task-list');
var taskTitleInput = document.querySelector('.dashboard-input');
var cardsSection = document.querySelector('.cards');
var clearBtn = document.querySelector('.clear-all');
var searchInput = document.querySelector('.search-input');
var filterUrgentBtn = document.querySelector('.urgency');
var dropDownBtn = document.querySelector('.drop-down-btn');
var dropDownContent = document.querySelector('.dropdown-content')

dropDownContent.addEventListener('click', advancedFilter)

function advancedFilter() {
  if(event.target.classList.contains('filter-option')) {
    console.log(event.target.parentElement)
    searchInput.placeholder = event.target.innerText;
    event.target.parentElement.classList.remove('show')
  }

}

dropDownBtn.addEventListener('click', showMenu)

function showMenu() {
  dropDownContent.classList.toggle('show')
}

filterUrgentBtn.addEventListener('click', function() {
  toggleDisplayUrgentCards();
  filterCards();
})

searchInput.addEventListener('keyup', filterCards)
taskTitleInput.addEventListener('keyup', validateMakeTaskList)
makeTaskList.addEventListener('click', createTaskList)
addTaskInput.addEventListener('keyup', validateTaskInput)
addTaskButton.addEventListener('click', addTask);
cardsSection.addEventListener("resize", resizeAllGridItems);
clearBtn.addEventListener('click', resetTasks)
taskListContainer.addEventListener('click', function(){
  removeTaskFromDrafts(event);
});
cardsSection.addEventListener('click', function(){
  deleteCard(event);
  checkOffTask(event);
  makeUrgent(event);
})

cardsSection.addEventListener('keypress', function(){
  editContent(event);
})

function editContent(e) {
  if ((e.target.classList.contains('card-title')
  || e.target.classList.contains('card-task-item'))
   && e.key === 'Enter') {
    var cardId = parseInt(e.target.closest('.card').id);
    var allTaskLists = getAllSavedTasks();
    var matchedTaskList = allTaskLists.filter(taskList => taskList.id === cardId)[0];
    makeEdits(e, matchedTaskList)
    e.preventDefault();
    e.target.blur();
  }
}

function makeEdits(e, matchedTaskList) {
  if (e.target.classList.contains('card-title')) {
    matchedTaskList.title = e.target.innerText;
    matchedTaskList.updateToDo();
  } else if (e.target.classList.contains('card-task-item')) {
    var taskId = parseInt(e.target.firstElementChild.id);
    var matchedTask = matchedTaskList.tasks.filter(function(task) {
      return taskId === task.id;
    })[0]
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].text = e.target.innerText;
    matchedTaskList.updateToDo();
  }
}

function editTask() {

}

setTimeout(function(){
  resizeAllGridItems();
}, 30);

loadCards();

function filterByTitle(task) {
  return task.title.toLowerCase().includes(searchInput.value.toLowerCase())
}

function filterByTask(taskList) {
  var result = taskList.tasks.forEach(function(task) {
    return task.text.toLowerCase().includes(searchInput.value.toLowerCase())
  })
}

function checkForTaskMatch (taskList) {
  var matched = false;
  for (var i = 0; i < taskList.tasks.length; i++){
    if (taskList.tasks[i].text.includes(searchInput.value)) {
      matched = true;
    }
  }
  return matched;
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
  console.log(matched)
}

function filterCards() {
  var allTaskLists = getAllSavedTasks();
  var filteredTasks = allTaskLists.filter(checkForTaskMatch);
  var filteredTaskList = allTaskLists.filter(filterByTitle);
  var filteredByTitleAndTask = allTaskLists.filter(filterByTitleAndTask);
  if (filterUrgentBtn.classList.contains('active')){
    filteredTaskList = filteredTaskList.filter(function(task) {
      return task.urgent
    })
  }
  if (searchInput.placeholder === 'Filter by task') {
    renderAndResizeCards(filteredTasks)
  } else if (searchInput.placeholder === 'Filter by title') {
    renderAndResizeCards(filteredTaskList)
  } else if (searchInput.placeholder === 'Search all' || searchInput.placeholder === 'Search' ) {
    renderAndResizeCards(filteredByTitleAndTask)
  }

}

function toggleDisplayUrgentCards() {
  filterUrgentBtn.classList.toggle('active');
  var allTaskLists = getAllSavedTasks();
  if (filterUrgentBtn.classList.contains('active')) {
    var urgentTaskList = allTaskLists.filter(function(task) {
      return task.urgent
    })
    renderAndResizeCards(urgentTaskList)
  } else {
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

function makeUrgent(e) {
  if (e.target.parentElement.classList.contains('card-urgent-icon')) {
    var card = e.target.parentElement.parentElement.parentElement
    var cardId = parseInt(event.target.parentElement.parentElement.parentElement.id);
    var allTaskLists = getAllSavedTasks();
    var matchedTaskList = allTaskLists.filter(taskList => taskList.id === cardId)[0];
    toggleUrgent(card, matchedTaskList);
    matchedTaskList.updateToDo();
  }
}

function addTask() {
  var task = new Task(addTaskInput.value)
  tasks.push(task);
  taskListContainer.innerHTML +=
  `<li><img src="./assets/delete.svg" class="delete-task">${task.text}</li>`
  addTaskInput.value = '';
  addTaskButton.setAttribute('disabled', 'disabled');
  validateMakeTaskList()
}

function checkForEmpty(list) {
  if (list.length === 0){
    cardsSection.classList.add('empty');
    cardsSection.innerHTML = '<h3>Create a to-do!</h3>';
    filterUrgentBtn.setAttribute('disabled');
  } else {
    cardsSection.classList.remove('empty');
    filterUrgentBtn.removeAttribute('disabled');
  }
}

function checkOffTask(event) {
  if (event.target.classList.contains('checkbox')) {
    toggleCheck();
    var taskId = parseInt(event.target.id);
    var cardId = parseInt(event.target.parentElement.parentElement.parentElement.parentElement.id);
    var matchedTaskList = getAllSavedTasks().filter(taskList => taskList.id === cardId)[0];

    var matchedTask = matchedTaskList.tasks.filter(function(task) {
      return taskId === task.id;
    })[0]
    matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done = !matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done

    console.log(matchedTaskList.tasks[matchedTaskList.tasks.indexOf(matchedTask)].done)

    // matchedTaskList.updateTask(parseInt(event.target.id));
    matchedTaskList.updateToDo();
    activateDeleteBtn(matchedTaskList);
  }
}

function activateDeleteBtn(matchedTaskList) {
  var deleteBtn = event.target.parentElement.parentElement.parentElement.nextElementSibling.firstElementChild.nextElementSibling;
  if (validateDelete(matchedTaskList)) {
    deleteBtn.classList.add('active')
  } else {
    deleteBtn.classList.remove('active')
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

function resetTasks() {
  taskTitleInput.value = '';
  tasks = [];
  taskListContainer.innerHTML = '';
}

function createTaskList() {
  var taskList = new ToDoList(taskTitleInput.value, tasks);
  taskList.saveToStorage();
  resetTasks();
  loadCards();
  resizeAllGridItems();
  validateMakeTaskList();
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
    checkForEmpty(allTaskLists);
  }
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

function makeTaskListHTML(taskList) {
  var taskListHTML = '';
  for (var i = 0; i < taskList.tasks.length; i++) {
    var task = taskList.tasks[i].text;
    var html = `<li contenteditable="true" class="card-task-item${taskList.tasks[i].done === false ? '' : ' checked'}"><img src="./assets/${taskList.tasks[i].done === false ? 'checkbox' : 'checkbox-active'}.svg" class="checkbox" id="${taskList.tasks[i].id}"><p>${task}</p></li>`
    taskListHTML += html;
  }
  return taskListHTML;
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

function resizeAllGridItems(){
  var allItems = document.querySelectorAll(".card");
  for (var i = 0; i < allItems.length; i++) {
    resizeGridItem(allItems[i]);
  }
}

function resizeGridItem(item){
  rowHeight = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(cardsSection).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap+64.4219)/(rowHeight+rowGap));
  item.style.gridRowEnd = "span "+rowSpan;
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

function toggleCheck() {
  if (event.target.parentElement.classList.contains('checked')) {
    event.target.parentElement.classList.remove('checked');
    event.target.src = './assets/checkbox.svg';
  } else {
    event.target.parentElement.classList.add('checked')
    event.target.src = './assets/checkbox-active.svg';
  }
}
