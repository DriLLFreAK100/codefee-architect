import fs from 'fs';
import chalk from 'chalk';
import path from 'path';

const REPLACE_KEY = '#Component';
const LOG_MSG_HEADER = 'Generated Styled-Component';

const log = console.log;

const guard = async (componentName, outputDir) => {
  const existing = await fs.promises.readdir(outputDir);

  if (existing.some(e => e === componentName)) {
    log(chalk`
      ${LOG_MSG_HEADER} {red FAILED}
      Component with same name {yellow ${componentName}} exists
    `);

    return false;
  }

  return true;
}

const replaceContent = (source, key, value) => {
  return source.toString().replaceAll(key, value);
}

const printSuccess = (componentName, dir) => {
  log(chalk`
    ${LOG_MSG_HEADER} {green successfully}
    Name: {green ${componentName}}
    Location: {green ${dir}}
  `);
}

const printFail = (err) => {
  log(chalk`
    ${LOG_MSG_HEADER} {red FAILED}
    Message: {yellow ${err}}
  `);
}

const generate = async (outputPath, templatePath) => {
  const splits = outputPath.split(path.sep);
  const componentName = splits.pop();
  const outputDir = splits.join(path.sep);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  if (!await guard(componentName, outputDir)) {
    return;
  }

  Promise.resolve()
    .then(() => fs.promises.mkdir(outputPath))
    .then(() => Promise.all([
      fs.promises.readFile(`${templatePath}/Component/Component.style.tsx`),
      fs.promises.readFile(`${templatePath}/Component/Component.tsx`),
      fs.promises.readFile(`${templatePath}/Component/index.ts`)
    ]))
    .then(([
      styledContent,
      componentContent,
      indexContent
    ]) => {
      return Promise.all([
        fs.promises.writeFile(`${outputPath}/${componentName}` + '.styled.tsx', replaceContent(styledContent, REPLACE_KEY, componentName)),
        fs.promises.writeFile(`${outputPath}/${componentName}.tsx`, replaceContent(componentContent, REPLACE_KEY, componentName)),
        fs.promises.writeFile(`${outputPath}/index.ts`, replaceContent(indexContent, REPLACE_KEY, componentName)),
      ]);
    })
    .then(() => printSuccess(componentName, outputPath))
    .catch((err) => printFail(err));
}

export default generate;