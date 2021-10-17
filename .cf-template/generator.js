import fs from 'fs';
import chalk from 'chalk';
import path from 'path';
import { PlainCopyStrategy } from './.generator-strategy/plainCopy';

const log = console.log;

export const GENERATOR_STRATEGY = {
  PLAIN_COPY: 1,
}

const STRATEGY_MAP = {
  [GENERATOR_STRATEGY.PLAIN_COPY]: PlainCopyStrategy,
}

export class Generator {
  outputPath = '';
  templatePath = '';
  strategy = GENERATOR_STRATEGY.PLAIN_COPY;
  args = {};

  constructor(params) {
    Object.assign(this, params);
  }

  async guard(targetName, outputDir) {
    const existing = await fs.promises.readdir(outputDir);

    if (existing.some(e => e === targetName)) {
      this.printFail(`Target with name ${targetName} already exists`);
      return false;
    }

    return true;
  }

  printSuccess = (targetName, dir) => {
    log(chalk`
      Generate ${targetName} {green successfully}
      Name: {green ${targetName}}
      Location: {green ${dir}}
    `);
  }

  printFail(err) {
    log(chalk`
      Template Generation  {red FAILED}
      Message: {yellow ${err}}
    `);
  }

  async generate() {
    const splits = this.outputPath.split(path.sep);
    const targetName = splits.pop();
    const outputDir = splits.join(path.sep);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    if (!await this.guard(targetName, outputDir)) {
      return;
    }

    const strategy = new STRATEGY_MAP[this.strategy]({
      outputPath: this.outputPath,
      targetName,
      ...this.args
    });

    Promise.resolve()
      .then(() => fs.promises.mkdir(this.outputPath))
      .then(() => strategy.execute())
      .then(() => this.printSuccess(targetName, this.outputPath))
      .catch((err) => this.printFail(err));
  }
}