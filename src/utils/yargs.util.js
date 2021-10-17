import chalk from 'chalk';

export const yargsBuildExample = (yargsObject, examples = []) => {
  examples.forEach(e => {
    yargsObject.example(chalk`{green ${e.command}}`, e.description);
  });

  return yargsObject;
}
