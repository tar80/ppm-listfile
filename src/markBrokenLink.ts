/* @file Mark non-existent paths on ListFile */

import fso from '@ppmdev/modules/filesystem.ts';

for (const o = PPx.Entry.AllEntry; !o.atEnd(); o.moveNext()) {
  const path = o.Name;

  if (!fso.FileExists(path) && !fso.FolderExists(path)) {
    o.Mark = 1;
  }
}
