import '../polyfills';
import chalk from 'chalk';
import cloneDeep from 'lodash/cloneDeep';
import fs from 'fs';
import fse from 'fs-extra';
import inquirer from 'inquirer';
import path from 'path';
import { Pipeline } from '../utils';
import { CONFIG_FILE_NAME, TEMPLATE_FOLDER_NAME } from './constants';
import defaultConfig from '../../codefee-template.config.json';

const log = console.log;

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
  log(msg);
}

const templateConfigQuestions = [
  {
    name: 'baseDir',
    message: 'Base Directory for Template Generation (default - ./src):'
  }
];

const scaffoldConfigFile = () => {
  return inquirer
    .prompt(templateConfigQuestions)
    .then(({ baseDir }) => {
      let config = cloneDeep(defaultConfig);
      config.baseDir = baseDir || './src';

      return config;
    })
    .then((config) => {
      fs.promises.writeFile(CONFIG_FILE_NAME, JSON.stringify(config, undefined, 2))
    });
}

const scaffoldTemplateFolder = () => {
  return fs.promises
    .mkdir(TEMPLATE_FOLDER_NAME)
    .then(() => {
      return fse.copy(
        path.normalize(`${__dirname}/../../${TEMPLATE_FOLDER_NAME}`),
        path.normalize(`${process.cwd()}/${TEMPLATE_FOLDER_NAME}`),
        {
          recursive: true,
        }
      );
    });
}

const setup = () => {
  return fs.promises
    .readdir(`.${path.sep}`)
    .then((files) => {
      const innerTasks = [];

      if (!files.some(f => f === CONFIG_FILE_NAME)) {
        innerTasks.push(scaffoldConfigFile());
      }

      if (!files.some(f => f === TEMPLATE_FOLDER_NAME)) {
        innerTasks.push(scaffoldTemplateFolder());
      }

      return Promise.all(innerTasks);
    });
};

const generate = (type, name) => async () => {
  const configs = JSON.parse(await fs.promises.readFile(CONFIG_FILE_NAME));
  const targetTemplate = type || configs.default;

  const config = Object
    .entries(configs.templates)
    .filter(([
      name,
      { alias },
    ]) => (name === targetTemplate || alias === targetTemplate))[0];

  if (!config) {
    log(chalk`
      {red Template config "${targetTemplate}" is not found.}
      Make sure the template has been setup at {yellow ${CONFIG_FILE_NAME}}
    `);

    return;
  }

  const outputPath = path.normalize(`${process.cwd()}/${configs.baseDir}/${name}`);
  const templatePath = path.normalize(`${process.cwd()}/${TEMPLATE_FOLDER_NAME}/${config[0]}`);

  let templateEntry = undefined;

  try {
    templateEntry = await import(templatePath);
  } catch (ex) {
    log(ex)

    log(chalk`
    {red Template instruction "${targetTemplate}" missing in ${TEMPLATE_FOLDER_NAME}.}
    Make sure the template has been setup at {yellow ${TEMPLATE_FOLDER_NAME}}
  `);
    return;
  }

  templateEntry.default(
    path.normalize(outputPath),
    path.normalize(templatePath),
  );
}

export default cli;