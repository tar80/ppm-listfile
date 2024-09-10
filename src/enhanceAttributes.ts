/* @file Enhanced attribute changes
 * @arg 0 {string} - Specify ListFile encode. "utf8" | "sjis"
 */

import {validArgs} from '@ppmdev/modules/argument.ts';
import {useLanguage} from '@ppmdev/modules/data.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr} from '@ppmdev/modules/guard.ts';
import {confirmFileEncoding, readLines, writeLines} from '@ppmdev/modules/io.ts';
import {langEnhanceAttributes} from './mod/language.ts';
import {getIndex} from './mod/core.ts';
import debug from '@ppmdev/modules/debug.ts';

const LIST_NAME = "%sgu'ppmcache'\\complist\\attributes.txt";
const lang = langEnhanceAttributes[useLanguage()];

const main = () => {
  const [encSpec] = validArgs();
  const entry = PPx.Extract('%R');

  if (fso.FileExists(entry) || fso.FolderExists(entry)) {
    PPx.Execute('%K"@A"');

    return;
  }

  const dirType = PPx.DirectoryType;

  if (dirType !== 4) {
    return;
  }

  const path = PPx.Extract('%FDV');
  const enc = confirmFileEncoding(encSpec);
  const [error, data] = readLines({path, enc});

  if (error) {
    PPx.linemessage(`!"${lang.couldNotRead}`);
    PPx.Quit(-1);
  }

  const idx = getIndex(data.lines);
  const lfData = data.lines[idx];

  if (!~lfData.indexOf(entry)) {
    PPx.linemessage(`!"${lang.couldNotGetEntry}`);

    return;
  }

  const rgx = /^(.+",A:H)(\d+)(,.+)$/;
  const att = getAttbibute(rgx, lfData);
  const title = '%*getcust(Mes0411:7800)';
  const inputOpts =
    `'title': '${title} : ${att}',` +
    "'mode':'e'," +
    "'list':'on'," +
    "'module':'off'," +
    "'detail':'user1'," +
    "'leavecancel':false," +
    `'file':'${LIST_NAME}'`;
  const input = PPx.Extract(`%*script("%sgu'ppmlib'\\input.js","{${inputOpts}}")`);

  if (input === '[error]' || isEmptyStr(input)) {
    return;
  }

  data.lines[idx] = lfData.replace(rgx, `$1${input}$3`);
  const [error2, errorMsg] = writeLines({data: data.lines, path, enc, linefeed: data.nl, overwrite: true});

  if (error2) {
    PPx.Echo(errorMsg);
    PPx.Quit(-1);
  }

  if (dirType === 4) {
    PPx.Execute('*wait 100,1%:*jumppath -savelocate');
  }
};

const getAttbibute = (rgx: RegExp, data: string): string => {
  const match = rgx.exec(data);

  return match ? match[2] : '-';
};

main();
