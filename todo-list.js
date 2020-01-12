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

  updateTask(taskId) {
    for (var i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === taskId) {
        console.log(this.tasks[i].text)
        this.tasks[i].text 
      }
    }
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
