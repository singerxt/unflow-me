const frt = require('flow-remove-types');
const [ ,,path ] = process.argv;
const fs = require('fs-extra');


/**
 * flowCleanUp
 * - Create backup directory
 * - Execute flow-remove-types on original director and put output to new directory
 * - Merge original directory with flow-remove-types result
 * - Remove backup director
 * @param {?string} relative path to directory
 */
async function flowCleanUp(dir) {
  if (typeof dir !== 'string' || !dir) {
    throw new Error(`
      Missing directory path.
      $ flow-clean-up ./directory
    `);
  }

  const fileInfo = await fs.lstat(dir);

  if (!fileInfo.isDirectory()) {
    throw new Error(`
      Path is not directory
    `);
  }

  const tmpDirPath = `tmp_${dir}`;
  const unflowedDirPath = `unflowed_${dir}`;

  console.log(`📂 Creating backup folder ${tmpDirPath}`);
  await fs.copy(dir, `${tmpDirPath}`);
  console.log('💪 tmp directory is ready!');
  console.log(`💔 Remove flow types from ${tmpDirPath} to ${unflowedDirPath}`);
  const { spawnSync } = require( 'child_process' );
  const frtr = spawnSync( 'flow-remove-types', [ dir, '--out-dir', unflowedDirPath ] );
  console.log(`💪 Created ${unflowedDirPath}!`);
  await fs.copy(unflowedDirPath, dir, {
    overwrite: true,
  });
  console.log('😀 Replaced... removing tmp files');
  await fs.remove(unflowedDirPath);
  await fs.remove(tmpDirPath);
};

flowCleanUp(path).catch(console.log).then(console.log.bind(console));
