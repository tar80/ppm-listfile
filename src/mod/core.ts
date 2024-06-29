import type {FileEncode} from '@ppmdev/modules/types.ts';
import {info} from '@ppmdev/modules/data.ts';

/**
 * Returns a string of type FileEncode
 * @param enc - A string that seems to be FileEncode
 * @return "utf8" | "utf16le" | "sjis" as FileEncode
 */
export const fileEnc = (enc: string): FileEncode => (enc === 'utf8' || enc === 'sjis' ? enc : info.encode);

/**
 * Adjust and return the mark/highlight attribute value of a string in ListFile format
 * @param line A string in ListFile format
 * @param hl A Highlight attribute value
 * @param hl A Mark attribute value
 * @return Adjusted string
 */
export const keepState = (line: string, hl: string, mark: string): string => {
  const rgx = /^(.+S:[\d\.]+)(,R:[\d\.]+)?(X:\d+)?(H:\d+)?(M:(-1|0|1))?(,T:"(.+)")?(.*)$/;

  return line.replace(rgx, `$1$2$3${hl}${mark}$7$9`);
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
export const getIndex = (data: string[]): number => {
  let n = 0;

  while (data.length > n) {
    if (data[n].indexOf(';') !== 0) {
      break;
    }

    n++;
  }

  return PPx.Entry.Index + _dotEntries() + n;
};
