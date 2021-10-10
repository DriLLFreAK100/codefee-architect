import '../polyfills';
import chalk from 'chalk';
import fs from 'fs';
import fse from 'fs-extra';
import path from 'path';
import { Pipeline } from '../utils';
import { CONFIG_FILE_NAME, TEMPLATE_FOLDER_NAME } from './constants';
import defaultConfig from '../../codefee-template.config.json';

const cli = async (args) => {
  const pipeline = new Pipeline().add(setup);

  if (args.init) {
    await pipeline
      .add(print(chalk`{green Template Init Successfully}`))
      .execute();

    return;
  }

  await pipeline
    .add(generate(args.type, args._))
    .execute();
}

const print = (msg) => () => {
  console.log(msg);
}

const setup = () => {
  return fs.promises
    .readdir(`.${path.sep}`)
    .then((files) => {
      const innerTasks = [];

      if (!files.some(f => f === CONFIG_FILE_NAME)) {
        innerTasks.push(fs.promises.writeFile(CONFIG_FILE_NAME, JSON.stringify(defaultConfig, undefined, 2)));
      }

      if (!files.some(f => f === TEMPLATE_FOLDER_NAME)) {
        const scaffoldTemplateFolder = fs.promises.mkdir(TEMPLATE_FOLDER_NAME)
          .then(() => {
            return fse.copy(
              path.normalize(`${__dirname}/../../${TEMPLATE_FOLDER_NAME}`),
              path.normalize(`${process.cwd()}/${TEMPLATE_FOLDER_NAME}`),
              {
                recursive: true,
              }
            );
          });

        innerTasks.push(scaffoldTemplateFolder);
      }

      return innerTasks;
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