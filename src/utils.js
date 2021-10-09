export class Pipeline {
  tasks = [];

  add(task) {
    this.tasks.push(task);
    return this;
  }

  execute() {
    let promise = Promise.resolve();

    this.tasks.forEach(async task => {
      try {
        promise = promise.then((res) => task(res));
      } catch (ex) {
        console.log(ex);
      }
    });
  }
}
