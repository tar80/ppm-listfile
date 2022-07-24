//!*script
/**
 * Passing the Listfile entry information to the method
 *
 * @arg 0 Method to execute
 * @arg 1 If nonzero allow duplicate paths
 * )
 */

'use strict';

const TERM_PREFIX = 'result => ';

/* Initial */
// Read module
const st = PPx.CreateObject('ADODB.stream');
let module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  const data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
const util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
const method = module(PPx.Extract('%*getcust(S_ppm#global:cache)\\script\\lf_method.js'));
module = null;

const g_args = ((args = PPx.Arguments()) => {
  const len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    length: len,
    method: args.Item(0),
    allowDup: len > 1 ? args.Item(1) | 0 : 0
  };
})();

// Get search term from header
const g_term = (() => {
  for (let [i, l] = [0, PPx.EntryDisplayCount]; i < l; i++) {
    const thisComment = PPx.Entry(i).Comment;

    if (thisComment.includes(TERM_PREFIX)) {
      return thisComment.split(TERM_PREFIX)[1];
    }
  }
})();

// If the search term contains a commit-hash, change to the method for Git-grep
if (/^[0-9a-zA-Z]{7}@@@/.test(g_term)) {
  g_args.method = g_args.method + '_commit';
}

// Load Methods
const initRun = ((name = g_args.method) => {
  const cmd = method[name];

  if (cmd === '') {
    util.quitMsg(`Not found ${name}`);
  }

  return Function('path', 'shortname', 'number', 'duplicate', 'term', `return ${cmd}()`);
})();

/* Initial run */
const run = initRun();

/* Subsequent run */
const entries = PPx.Extract('%#;FDC').split(';');
const markCount = PPx.EntryMarkCount;

// Initial value of the loop depending on the mark
const hasMark = !markCount ? 0 : 1;

// For ShortName
const reg = /^[0-9]*/;

// Check for duplicates
let exists = {};

const thisEntry = PPx.Entry();
thisEntry.FirstMark;

const fso = PPx.CreateObject('Scripting.FileSystemObject');

for (let i = hasMark; i <= markCount; i++) {
  if (fso.FileExists(thisEntry.Name)) {
    // Get FullPath
    const path = entries[i - hasMark];

    // Get ShortName
    const sn = thisEntry.ShortName;

    // Get ShortName as a number
    const num = reg.test(sn) ? sn | 0 : 1;

    // Duplicate Entry Identification
    const dup = (() => {
      const isDup = exists[path] || false;
      exists[path] = true;
      return isDup;
    })();

    // Determine duplicate entries and pass them to the method
    if (g_args.allowDup === 1 || !dup) {
      run(path, sn, num, dup, g_term);
    }
  }

  thisEntry.NextMark;
}
