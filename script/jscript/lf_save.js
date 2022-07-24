//!*script
// deno-lint-ignore-file no-var
/**
 * Save Listfile order, comments, and mark status
 *
 * NOTE: Listfile format follows "*makelistfile -basic"
 */

// Maximum number of header lines to retrieve
var RSV_HEADER = 5;

// Linefeed code for output file
var NL_CHAR = '\r\n';

// List current entry status
var new_items = (function () {
  // Consider dot entries. "." and ".."
  var dotEntries = (function () {
    var path = PPx.Extract('%*getcust(XC_tdir)').split(',');
    return Number(path[0]) + Number(path[1]);
  })();
  var items = [];

  for (var i = dotEntries, l = PPx.EntryDisplayCount; i < l; i++) {
    var thisEntry = PPx.Entry(i);

    if (thisEntry.state === 1) {
      continue;
    }

    if (thisEntry.Name !== thisEntry.ShortName) {
      items.push({index: i, value: '"' + thisEntry.Name + '","' + thisEntry.ShortName + '"'});
      continue;
    }

    items.push({index: i, value: '"' + thisEntry.Name + '",""'});
  }

  return items;
})();

var path_list = PPx.Extract('%FDV').replace('::listfile', '');
var fso = PPx.CreateObject('Scripting.FileSystemObject');

// Get entry status stored in Listfile source
var old_items = (function () {
  var items = [];
  var readFile = fso.OpenTextFile(path_list, 1, false, -1);

  while (!readFile.AtEndOfStream) {
    items.push(readFile.ReadLine());
  }

  readFile.Close();
  return items;
})();

// Entry order to save
var new_list = (function (items) {
  var header = [];

  // Get header
  for (var i = 0, l = Math.min(RSV_HEADER, items.length); i < l; i++) {
    if (items[i].indexOf(';') === 0) {
      header.push(items[i]);
    }
  }

  return header;
})(old_items);

// Retrieve the order of entries in listfile format
for (var i = 0, l = new_items.length; i < l; i++) {
  var newItem = new_items[i];
  var matchItem = '';

  // Retrieve line information from the listfile source that matches the entry
  for (var j = 0, k = old_items.length; j < k; j++) {
    var oldItem = g_oldItems[j];
    if (~oldItem.indexOf(newItem.value)) {
      matchItem = oldItem.split(',');
    }
  }

  var thisEntry = PPx.Entry(newItem.index);
  var cmnt = thisEntry.Comment.replace(/"/g, '""');
  var mark = thisEntry.Mark;
  var hl = thisEntry.Highlight;

  new_list.push(
    matchItem.length < 6
      ? newItem + ',A:H0,C:0.0,L:0.0,W:0.0,S:0.0,H:' + hl + ',M:' + mark + ',T:"' + cmnt + '"'
      : matchItem.splice(0, 7) + ',H:' + hl + ',M:' + mark + ',T:"' + cmnt + '"'
  );
}

// Reset updates held by PPc
PPx.Execute('%K"@F5');

// Export the replacement result and overwrite with Utf16le
var writeFile = fso.OpenTextFile(path_list, 2, true, -1);
writeFile.Write(new_list.join(NL_CHAR) + NL_CHAR);
writeFile.Close();

if (PPx.DirectoryType === 4) {
  PPx.Execute('*wait 200,1 %: %K"@F5"');
}
