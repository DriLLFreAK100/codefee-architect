import chalk from 'chalk';

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


export const yargsBuildExample = (yargsObject, examples = []) => {
  examples.forEach(e => {
    yargsObject.example(chalk`{green ${e.command}}`, e.description);
  });

  return yargsObject;
}