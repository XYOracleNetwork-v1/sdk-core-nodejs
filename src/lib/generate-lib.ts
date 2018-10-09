/*
 * @Author: XY | The Findables Company <ryanxyo>
 * @Date:   Wednesday, 26th September 2018 10:35:13 am
 * @Email:  developer@xyfindables.com
 * @Filename: generate-lib.ts
 * @Last modified by: ryanxyo
 * @Last modified time: Tuesday, 9th October 2018 10:12:59 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

/**
 * A script that generates the library exports
 */

import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const logger = console;

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function generateLibString() {
  const parentDirectory = path.dirname(__dirname).split(path.sep).pop() as string;
  const exportsDest: string[] = [];
  await inspectFolder('../', parentDirectory, exportsDest);
  const excludes = [
    /..\/lib/,
    /spec\.ts/,
    /\.d\.ts/
  ];

  const filteredExports = exportsDest.filter((exportCandidate) => {
    const shouldInclude = excludes.filter((excludeRegEx) => {
      return excludeRegEx.test(exportCandidate);
    })
    .length === 0;
    if (!shouldInclude) {
      logger.warn(`Excluding ${exportCandidate}`);
    }
    return shouldInclude;
  });

  const mappedExports = filteredExports.map((item) => {
    let trimIndex = item.indexOf('.d.ts');
    trimIndex = trimIndex === -1 ? item.indexOf('.ts') : trimIndex;
    if (trimIndex === -1) {
      return undefined;
    }

    const exportPath = item.substring(0, trimIndex);
    return `export * from '${exportPath}';`;
  })
  .filter(item => item !== undefined)
  .join('\n');

  logger.info(`// Auto-generated on ${new Date()}\n\n${mappedExports}\n`);
}

async function inspectFolder(relativePrefix: string, pathToTest: string, exportsDest: string[]) {
  const itemsInFolder = await readdir(pathToTest);

  await Promise.all(itemsInFolder.map(async (item) => {
    const fullPath = path.join(pathToTest, item);
    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      const newRelativePrefix = (path.join(relativePrefix, item));
      return inspectFolder(newRelativePrefix, fullPath, exportsDest);
    }

    if (/\.ts$/.test(item)) {
      const pathToAdd = path.join(relativePrefix, item);
      exportsDest.push(pathToAdd);
    }
  }));

  return exportsDest;
}

if (require.main === module) {
  generateLibString();
}
