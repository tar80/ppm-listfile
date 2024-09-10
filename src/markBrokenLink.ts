/* @file Mark non-existent paths on ListFile */

import fso from '@ppmdev/modules/filesystem.ts';

for (const obj = PPx.Entry.AllEntry; !obj.atEnd(); obj.moveNext()) {
  const path = obj.Name;

  if (!fso.FileExists(path) && !fso.FolderExists(path)) {
    obj.Mark = 1;
  }
}
