/* @file Update ListFile
 * @arg 0 {string} - Specify ListFile encode. "utf8" | "sjis"
 * NOTE: ListFile format follows "*makelistfile -basic"
 */

import {info, useLanguage} from '@ppmdev/modules/data.ts';
import {confirmFileEncoding, readLines, writeLines} from '@ppmdev/modules/io.ts';
import {validArgs} from '@ppmdev/modules/argument.ts';
import {isEmptyStr, isZero, withinRange} from '@ppmdev/modules/guard.ts';
import {langLF} from './mod/language.ts';
import {keepState} from './mod/core.ts';

const lang = langLF[useLanguage()];

const main = (): void => {
  const [encSpec] = validArgs();
  const path = PPx.Extract('%FDV').replace('::listfile', '');
  const exitcode = PPx.Execute('%K"@w"');

  if (exitcode !== 0) {
    PPx.linemessage(`!"${lang.failedRewrite}`);
    PPx.Quit(-1);
  }

  const enc = confirmFileEncoding(encSpec);
  const [error, data] = readLines({path, enc, linefeed: info.nlcode});

  if (error) {
    PPx.linemessage(`!"${lang.couldNotRead}`);
    PPx.Quit(-1);
  }

  for (const o = PPx.Entry.AllEntry; !o.atEnd(); o.moveNext()) {
    const hl = o.Highlight > 0 && withinRange(o.Highlight, 7) ? `,H:${o.Highlight}` : '';
    const mark = !isZero(o.Mark) ? `,M:1` : '';

    if (!isEmptyStr(hl) || !isEmptyStr(mark)) {
      for (let i = 0, k = data.lines.length; i < k; i++) {
        const line = data.lines[i];
        if (~line.indexOf(o.Name)) {
          data.lines[i] = keepState(line, hl, mark);
        }
      }
    }
  }

  const [error2, errorMsg] = writeLines({path, data: data.lines, enc, linefeed: data.nl, overwrite: true});

  if (error2) {
    PPx.linemessage(`!"${errorMsg}`);
    PPx.Quit(-1);
  }

  ignoreSaveComment();
};

/**
 * Temporarily disable manual rewrites
 */
const ignoreSaveComment = (): void => {
  const PROP_NAME = 'XC_cwrt';
  const LABEL = 'ppm_lf_update';
  const ID = 'KC_main:LOADEVENT';
  const cwrt = PPx.Extract(`%*getcust(${PROP_NAME})`);
  PPx.Execute(`*setcust ${PROP_NAME}=0`);
  PPx.Execute(`*linecust ${LABEL},${ID},*setcust ${PROP_NAME}=${cwrt}%%:*linecust ${LABEL},${ID},`);
};

main();
