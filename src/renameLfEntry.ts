/* @file Rename ListFile entry
 * @arg 0 {string} - Specify ListFile encode. "utf8" | "sjis"
 * @return - PPx.DirectoryType
 */

import {safeArgs} from '@ppmdev/modules/argument.ts';
import {info, useLanguage} from '@ppmdev/modules/data.ts';
import debug from '@ppmdev/modules/debug.ts';
import fso from '@ppmdev/modules/filesystem.ts';
import {isEmptyStr, isZero} from '@ppmdev/modules/guard.ts';
import {confirmFileEncoding, readLines, writeLines} from '@ppmdev/modules/io.ts';
import {langLF} from './mod/language.ts';

const lang = langLF[useLanguage()];

const main = (): number => {
  const [encspec] = safeArgs(info.encode);
  const dirType = PPx.DirectoryType;

  if (PPx.EntryState < 2) {
    PPx.Quit(-1);
  }

  if (dirType !== 4) {
    return dirType;
  }

  const entry = PPx.Extract('%FDCN');
  const enc = confirmFileEncoding(encspec);

  if (fso.FileExists(entry) || fso.FolderExists(entry)) {
    PPx.Execute('%K"@R"');

    return 4;
  }

  const input = PPx.Extract(`%*input("%C" -title:"${lang.rename}" -mode:Ec -k *cursor -8%%:*mapkey use,K_ppmRename)`);
  const exitcode = PPx.Extract();

  if (!isZero(exitcode) || isEmptyStr(input)) {
    return 4;
  }

  const path = PPx.Extract('%FDV');
  const [error, data] = readLines({path, enc, linefeed: info.nlcode});

  if (error) {
    PPx.linemessage(`!"${lang.couldNotRead}`);
    PPx.Quit(-1);
  }

  const name = PPx.Extract('%R');
  const rgx = /^"[^"]+",(.+)$/;

  for (let i = 0, k = data.lines.length; i < k; i++) {
    const line = data.lines[i];

    if (line.indexOf(name) === 1) {
      data.lines[i] = line.replace(rgx, `"${input}",$1`);
    }
  }

  const [error2, errorMsg] = writeLines({path, data: data.lines, enc, overwrite: true, linefeed: data.nl});

  if (error2) {
    PPx.linemessage(`!"${errorMsg}`);
    PPx.Quit(-1);
  }

  PPx.Execute(`*wait 100,1%:*jumppath -entry:"${input}"`);

  return 4;
};

PPx.result = main();
