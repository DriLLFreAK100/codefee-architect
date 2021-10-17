import { Generator, GENERATOR_STRATEGY } from '../generator';
import path from 'path';

const generate = (outputPath, templatePath) => new Generator({
  outputPath,
  templatePath,
  strategy: GENERATOR_STRATEGY.PLAIN_COPY,
  args: {
    templateReplaceKey: '#Component',
    copyTargetDir: path.normalize(`${templatePath}/Component`),
  },
}).generate();


export default generate;