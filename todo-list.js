class ToDoList {
  constructor(title, tasks) {
    this.id = new Date().valueOf();
    this.title = title;
    this.urgent = false;
    this.tasks = tasks;
  }

  saveToStorage() {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    allTaskLists.push(this);
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }

  deleteFromStorage() {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    allTaskLists = reinstantiateAllTasksList(allTaskLists);
    allTaskLists.splice(allTaskLists.indexOf(this), 1);
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }

  updateToDo() {

  }

  updateTask() {

  }
}
