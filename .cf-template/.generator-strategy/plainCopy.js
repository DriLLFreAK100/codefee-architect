import fs from 'fs';
import path from 'path';
import '../polyfills';

export class PlainCopyStrategy {
  copyTargetDir = '';
  outputPath = '';
  targetName = '';
  templateReplaceKey = '';

  constructor(params) {
    Object.assign(this, params);
  }

  replaceContent(source, key, value) {
    return source.toString().replaceAll(key, value);
  }

  async execute() {
    return fs.promises
      .readdir(this.copyTargetDir)
      .then(files => {
        return new Promise((resolve) => {
          files.map(async file => {
            const content = await fs.promises.readFile(path.normalize(`${this.copyTargetDir}/${file}`));

            const modifiedFileName = file.split('.');
            modifiedFileName.splice(0, this.targetName);

            await fs.promises.writeFile(
              `${this.outputPath}/${modifiedFileName}`,
              this.replaceContent(content, this.templateReplaceKey, this.targetName)
            );

            resolve();
          });
        });
      });
  }
}