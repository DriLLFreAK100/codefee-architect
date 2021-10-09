import '../polyfills';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { Pipeline } from '../utils';
import { CONFIG_FILE_NAME, TEMPLATE_FOLDER_NAME } from './constants';

const cli = async (args) => {
  await new Pipeline()
    .add(setup)
    .add(generate(args.type, args._))
    .execute();
}

const setup = () => {
  return fs.promises
    .readdir(`.${path.sep}`)
    .then((files) => {
      const innerTasks = [];

      if (!files.some(f => f === CONFIG_FILE_NAME)) {
        console.log(files);
        innerTasks.push(fs.promises.writeFile(CONFIG_FILE_NAME, JSON.stringify({})));
      }

      if (!files.some(f => f === TEMPLATE_FOLDER_NAME)) {
        innerTasks.push(fs.promises.mkdir(TEMPLATE_FOLDER_NAME));
      }
    });
};

const generate = (type, name) => async () => {
  const configs = JSON.parse(await fs.promises.readFile(CONFIG_FILE_NAME));
  const config = Object.entries(configs.templates).filter(([name, { alias }]) => (name === type || alias === type))[0];

  if (!config) {
    console.log(chalk`
      {red Template "${type}" is not found.}
      Make sure the template has been setup at {yellow ${TEMPLATE_FOLDER_NAME}}
    `);

    return;
  }

  const outputPath = path.normalize(`${process.cwd()}/${configs.baseDir}/${name}`);
  const templatePath = path.normalize(`${process.cwd()}/${TEMPLATE_FOLDER_NAME}/${config[0]}`);
  const templateEntry = await import(templatePath);

  templateEntry.default(
    path.normalize(outputPath),
    path.normalize(templatePath),
  );
}

export default cli;