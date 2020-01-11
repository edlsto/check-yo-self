class Task {
  constructor(text) {
    this.done = false;
    this.id = new Date().valueOf();
    this.text = text;
  }
}
