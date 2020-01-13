class ToDoList {
  constructor(title, tasks, id, urgent) {
    this.id = id || new Date().valueOf();
    this.title = title;
    this.urgent = urgent || false;
    this.tasks = tasks;
  }

  saveToStorage() {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    allTaskLists.push(this);
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }

  deleteFromStorage() {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    for (var i = 0; i < allTaskLists.length; i++) {
      if (this.id === allTaskLists[i].id){
        allTaskLists.splice(i, 1)
      }
    }
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }

  updateTask(id) {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    var taskId = parseInt(id);
    var matchedTask = this.tasks.filter(function(task) {
      return taskId === task.id;
    })[0]
    for (var i = 0; i < allTaskLists.length; i++) {
      if (this.id === allTaskLists[i].id){
        for (var j = 0; j < allTaskLists[i].tasks.length; j++) {
          if (allTaskLists[i].tasks[j].id === matchedTask.id) {
            allTaskLists[i].tasks[j] = matchedTask;
          }
        }
      }
    }
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }

  updateToDo() {
    var allTaskLists = JSON.parse(localStorage.getItem('allTaskLists')) || [];
    for (var i = 0; i < allTaskLists.length; i++) {
      if (this.id === allTaskLists[i].id){
        allTaskLists[i].title = this.title;
        allTaskLists[i].urgent = this.urgent;
        allTaskLists[i].tasks = this.tasks;
      }
    }
    localStorage.setItem('allTaskLists', JSON.stringify(allTaskLists));
  }
  
}
