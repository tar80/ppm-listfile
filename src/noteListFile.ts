/* @file Add notes entry on ListFile
 * @arg 0 {string} - Specify ListFile path for note
 * @arg 1 {string} - Specify ListFile encode. "utf8" | "sjis"
 */

import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {buildLfItem} from '@ppmdev/parsers/listfile.ts';
import {safeArgs} from '@ppmdev/modules/argument.ts';
import {info, useLanguage} from '@ppmdev/modules/data.ts';
import {readLines, writeLines} from '@ppmdev/modules/io.ts';
import {langNoteListFile} from './mod/language.ts';
import {fileEnc} from './mod/core.ts';
import debug from '@ppmdev/modules/debug.ts';

const lang = langNoteListFile[useLanguage()];

const main = () => {
  const [pathSpec, argEnc] = safeArgs(undefined, info.encode);
  const dirType = PPx.DirectoryType;
  const path = dirType === 4 ? PPx.Extract('%FDV').replace('::listfile', '') : pathSpec;

  if (!path) {
    PPx.linemessage(`!"${lang.notListFile}`);
    PPx.Quit(-1);
  }

  const [att, input] = noteEntry();

  if (isEmptyStr(input)) {
    return;
  }

  const lfItem = buildLfItem({name: input, att});

  if (!lfItem) {
    return;
  }

  let error, errorMsg;
  const enc = fileEnc(argEnc);

  if (dirType === 4) {
    const [error1, data] = readLines({path, enc, linefeed: info.nlcode});

    if (error1) {
      PPx.linemessage(`!"${data}`);
      PPx.Quit(-1);
    }

    data.lines.splice(getIndex(data.lines), 0, lfItem);

    [error, errorMsg] = writeLines({path, data: data.lines, enc, overwrite: true, linefeed: data.nl});
  } else {
    [error, errorMsg] = writeLines({path, data: [lfItem], enc, append: true, linefeed: info.nlcode});
  }

  if (error) {
    PPx.linemessage(`!"${errorMsg}`);
    PPx.Quit(-1);
  }

  if (dirType === 4) {
    PPx.Execute('*wait 100,1%:*jumppath -savelocate');
    PPx.Entry.State = 4;
  }
};

/**
 * Obtain user input and perform escape processing
 * @return `[attributes, escaped input]`
 */
const noteEntry = (): [number, string] => {
  const inputOpts = `'title':'Note  ${lang.subTitle}','mode':'e','leavecancel':true,'list':false,'module':false`;
  const input = PPx.Extract(`%*script("%sgu'ppmlib'\\input.js","{${inputOpts}}")`);

  if (input === '[error]' || isEmptyStr(input)) {
    return [0, ''];
  }

  const DELIM = '#=8=#';
  const [attributes, note] = input.replace(/^((\d+):\s*)?(.+)$/, `$2${DELIM}$3`).split(DELIM);

  return [Number(attributes), note.replace(/"/g, '`')];
};

/**
 * Get the status of "." and ".." in the entry list
 * @return number of dot-entries
 */
const _dotEntries = (): number => {
  const [root, parent] = PPx.Extract('%*getcust(XC_tdir)').split(',');

  return Number(root) + Number(parent);
};

/**
 * Get the index of the cursor position on the ListFile
 * @param data Array of line information in the ListFile
 * @return Index number of cursor position in the ListFile
 */
const getIndex = (data: string[]): number => {
  let n = 0;

  while (data.length > n) {
    if (data[n].indexOf(';') !== 0) {
      break;
    }

    n++;
  }

  return PPx.Entry.Index + _dotEntries() + n;
};

main();
