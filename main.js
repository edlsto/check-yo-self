var tasks = [];
var addTaskButton = document.querySelector('.add');
var addTaskInput = document.querySelector('.task-item-input');
var taskListContainer = document.querySelector('.task-list-inner');
var makeTaskList = document.querySelector('.make-task-list');
var taskTitleInput = document.querySelector('.dashboard-input');
var cardsSection = document.querySelector('.cards')

addTaskButton.addEventListener('click', addTask);
taskListContainer.addEventListener('click', function(){
  removeTask(event);
});

cardsSection.addEventListener('click', function(){
  deleteCard(event);
})

function makeTaskListHTML(taskList) {
  var taskListHTML = '';
  for (var i = 0; i < taskList.tasks.length; i++) {
    var task = taskList.tasks[i].text;
    var html = `<li><img src="./assets/checkbox.svg">${task}</li>`
    taskListHTML += html;
  }
  return taskListHTML;
}

function renderCardsHTML(allTaskLists) {
  var cardsHTML = ''
  for (var i = allTaskLists.length - 1; i >= 0; i--){
    cardsHTML +=
    `<div class="card">
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

taskTitleInput.addEventListener('keyup', validateMakeTaskList)

makeTaskList.addEventListener('click', createTaskList)

addTaskInput.addEventListener('keyup', validateTaskInput)

function loadCards() {
  cardsSection.classList.remove('empty');
  var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
  allTaskLists = reinstantiateAllTasksList(allTaskLists);
  cardsSection.innerHTML = renderCardsHTML(allTaskLists);
}

loadCards();

function reinstantiateAllTasksList(allTaskLists) {
  var allTaskListsWithMethods = [];
  allTaskLists.forEach(function(taskList){
    allTaskListsWithMethods.push(new ToDoList(taskList.title, taskList.tasks));
  })
  return allTaskListsWithMethods;
}

function deleteCard(e) {
  if (e.target.parentElement.classList.contains('card-delete-icon')) {
    var title = e.target.parentElement.parentElement.previousElementSibling.previousElementSibling.innerText;
    var card = e.target.parentElement.parentElement.parentElement;
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    allTaskLists = reinstantiateAllTasksList(allTaskLists);
    allTaskLists.forEach(function(taskList){
      if (taskList.title === title) {
        card.remove();
        taskList.deleteFromStorage();
      }
    })
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

function validateTaskInput() {
  if (addTaskInput.value !== '') {
    addTaskButton.removeAttribute('disabled');
  } else {
    addTaskButton.setAttribute('disabled', 'disabled');
  }
}

function validateMakeTaskList() {
  if (tasks.length > 0 && taskTitleInput.value !== '') {
    makeTaskList.removeAttribute('disabled')
  } else {
    makeTaskList.setAttribute('disabled', 'disabled');
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

function removeTaskFromTasks(e) {
  tasks.forEach(function(task, i){
    if (e.target.parentElement.innerText === task.text) {
      tasks.splice(i, 1)
    };
  });
}

function removeTask(e) {
  if (e.target.classList.contains('delete-task')) {
    removeTaskFromTasks(e);
    e.target.parentNode.remove();
  };
  validateMakeTaskList()

}


var grid = document.querySelector(".cards");

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
