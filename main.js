var tasks = [];
var addTaskButton = document.querySelector('.add');
var addTaskInput = document.querySelector('.task-item-input');
var taskListContainer = document.querySelector('.task-list-inner');
var makeTaskList = document.querySelector('.make-task-list');
var taskTitleInput = document.querySelector('.dashboard-input');
var cardsSection = document.querySelector('.cards')
var grid = document.querySelector(".cards");

taskTitleInput.addEventListener('keyup', validateMakeTaskList)
makeTaskList.addEventListener('click', createTaskList)
addTaskInput.addEventListener('keyup', validateTaskInput)
addTaskButton.addEventListener('click', addTask);

taskListContainer.addEventListener('click', function(){
  removeTask(event);
});

cardsSection.addEventListener('click', function(){
  deleteCard(event);
  checkOffTask(event);
})

loadCards();

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
  }
}

function checkOffTask(event) {
  if (event.target.classList.contains('checkbox')) {
    toggleCheck();
    var taskId = parseInt(event.target.id);
    var cardId = parseInt(event.target.parentElement.parentElement.parentElement.parentElement.id);
    var allTaskLists = getAllSavedTasks();
    var matchedTaskList = allTaskLists.filter(taskList => taskList.id === cardId)[0];
    matchedTaskList.updateTask(taskId);
    matchedTaskList.updateToDo();
  }
}

function createTaskList() {
  var taskList = new ToDoList(taskTitleInput.value, tasks);
  taskList.saveToStorage();
  taskTitleInput.value = '';
  tasks = [];
  taskListContainer.innerHTML = '';
  cardsSection.classList.remove('empty');
  loadCards();
  resizeAllGridItems();
  validateMakeTaskList();
}

function deleteCard(e) {
  if (e.target.parentElement.classList.contains('card-delete-icon')) {
    var card = e.target.parentElement.parentElement.parentElement;
    card.remove()
    var allTaskLists = getAllSavedTasks();
    allTaskLists.forEach(function(taskList, i){
      if (taskList.id === parseInt(card.id)) {
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
    var html = `<li><img src="./assets/${taskList.tasks[i].done === false ? 'checkbox' : 'checkbox-active'}.svg" class="checkbox${taskList.tasks[i].done === false ? '' : ' checked'}" id="${taskList.tasks[i].id}">${task}</li>`
    taskListHTML += html;
  }
  return taskListHTML;
}

function reinstantiateAllTasksList(allTaskLists) {
  var allTaskListsWithMethods = [];
  allTaskLists.forEach(function(taskList){
    allTaskListsWithMethods.push(new ToDoList(taskList.title, taskList.tasks, taskList.id));
  })
  return allTaskListsWithMethods;
}

function removeTask(e) {
  if (e.target.classList.contains('delete-task')) {
    removeTaskFromTasks(e);
    e.target.parentNode.remove();
  };
  validateMakeTaskList()
}

function removeTaskFromTasks(e) {
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
    `<div class="card" id="${allTaskLists[i].id}">
        <h2>${allTaskLists[i].title}</h2>
        <div class="content">
          <ul>
            ${makeTaskListHTML(allTaskLists[i])}
          </ul>
          </div>
          <div class="icon-row">
            <div class="card-urgent-icon">
              <img src="./assets/urgent.svg">
              <p>Urgent</p>
            </div>
            <div class="card-delete-icon">
              <img src="./assets/delete.svg">
              <p>Delete</p>
            </div>
          </div>
    </div>`
  }
  return cardsHTML;
}

function validateMakeTaskList() {
  if (tasks.length > 0 && taskTitleInput.value !== '') {
    makeTaskList.removeAttribute('disabled')
  } else {
    makeTaskList.setAttribute('disabled', 'disabled');
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
  if (event.target.classList.contains('checked')) {
    event.target.classList.remove('checked');
    event.target.src = './assets/checkbox.svg';
  } else {
    event.target.classList.add('checked')
    event.target.src = './assets/checkbox-active.svg';
  }
}






grid.addEventListener("resize", resizeAllGridItems);

function resizeGridItem(item){
  rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
  rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
  rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height+rowGap+121.4219)/(rowHeight+rowGap));
  item.style.gridRowEnd = "span "+rowSpan;
}

function resizeAllGridItems(){
  var allItems = document.querySelectorAll(".card");
  for (var i = 0; i < allItems.length; i++) {
    resizeGridItem(allItems[i]);
  }
}
window.onload = setTimeout(function(){
  resizeAllGridItems();
}, 30);
