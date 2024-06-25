import type {FileEncode} from '@ppmdev/modules/types.ts';
import {info} from '@ppmdev/modules/data.ts';

export const fileEnc = (enc: string): FileEncode => (enc === 'utf8' || enc === 'sjis' ? enc : info.encode);

export const keepState = (line: string, hl: string, mark: string): string => {
  const rgx = /^(.+S:[\d\.]+)(,R:[\d\.]+)?(X:\d+)?(H:\d+)?(M:(-1|0|1))?(,T:"(.+)")?(.*)$/;

  return line.replace(rgx, `$1$2$3${hl}${mark}$7$9`);
};

