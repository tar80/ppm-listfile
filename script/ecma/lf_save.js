//!*script
/**
 * Save Listfile order, comments, and mark status
 *
 * NOTE: Listfile format follows "*makelistfile -basic"
 */

'use strict';

// Maximum number of header lines to retrieve
const RSV_HEADER = 5;

// Linefeed code for output file
const NL_CHAR = '\r\n';

// List current entry status
const new_items = (() => {
  // Consider dot entries. "." and ".."
  const dotEntries = (() => {
    const [wd, pwd] = PPx.Extract('%*getcust(XC_tdir)').split(',');
    return Number(wd) + Number(pwd);
  })();
  const items = new Map();

  for (let [i, l] = [dotEntries, PPx.EntryDisplayCount]; i < l; i++) {
    const thisEntry = PPx.Entry(i);

    if (thisEntry.state === 1) {
      continue;
    }

    if (thisEntry.Name !== thisEntry.ShortName) {
      items.set(i, `"${thisEntry.Name}","${thisEntry.ShortName}"`);
      continue;
    }

    items.set(i, `"${thisEntry.Name}",""`);
  }

  return items;
})();

const path_list = PPx.Extract('%FDV').replace('::listfile', '');
const fso = PPx.CreateObject('Scripting.FileSystemObject');

// Get entry status stored in Listfile source
const old_items = (() => {
  const items = [];
  const readFile = fso.OpenTextFile(path_list, 1, false, -1);

  while (!readFile.AtEndOfStream) {
    items.push(readFile.ReadLine());
  }

  readFile.Close();
  return items;
})();

// Retrieve the order of entries in listfile format
for (const [index, value] of new_items.entries()) {
  // Retrieve line information from the listfile source that matches the entry
  const matchItem = old_items.find((data) => data.includes(value));
  const matchItem_ = matchItem.split(',');

  const thisEntry = PPx.Entry(index);
  const cmnt = thisEntry.Comment.replace(/"/g, '""');
  const mark = thisEntry.Mark;
  const hl = thisEntry.Highlight;

  new_items.set(
    index,
    matchItem_.length < 6
      ? `${value},A:H0,C:0.0,L:0.0,W:0.0,S:0.0,H:${hl},M:${mark},T:"${cmnt}"`
      : `${matchItem_.splice(0, 7)},H:${hl},M:${mark},T:"${cmnt}"`
  );
}

// Reset updates held by PPc
PPx.Execute('%K"@F5');

// Entry order to save
const new_list_path = ((item = old_items) => {
  const header = [];

  // Get header
  for (let [i, l] = [0, Math.min(RSV_HEADER, item.length)]; i < l; i++) {
    if (item[i].indexOf(';') === 0) {
      header.push(item[i]);
    }
  }

  const reslut = [...header, ...new_items.values()];
  return reslut.reduce((p, c) => `${p}${NL_CHAR}${c}`) + NL_CHAR;
})();

// Export the replacement result and overwrite with Utf16le
const writeFile = fso.OpenTextFile(path_list, 2, true, -1);
writeFile.Write(new_list_path);
writeFile.Close();

if (PPx.DirectoryType === 4) {
  PPx.Execute('*wait 100,1 %: %K"@F5"');
}
