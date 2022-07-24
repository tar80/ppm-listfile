//!*script
// deno-lint-ignore-file no-var
/**
 * Passing the Listfile entry information to the method
 *
 * @arg 0 Method to execute
 * @arg 1 If nonzero allow duplicate paths
 * )
 */

var TERM_PREFIX = 'result => ';

/* Initial */
// Read module
var st = PPx.CreateObject('ADODB.stream');
var module = function (filepath) {
  st.Open;
  st.Type = 2;
  st.Charset = 'UTF-8';
  st.LoadFromFile(filepath);
  var data = st.ReadText(-1);
  st.Close;

  return Function(' return ' + data)();
};

// Load module
var util = module(PPx.Extract('%*getcust(S_ppm#global:module)\\util.js'));
var method = module(PPx.Extract('%*getcust(S_ppm#global:cache)\\script\\lf_method.js'));
module = null;

var g_args = (function (args) {
  var len = args.length;

  if (len < 1) {
    util.error('arg');
  }

  return {
    length: len,
    method: args.Item(0),
    allowDup: len > 1 ? args.Item(1) | 0 : 0
  };
})(PPx.Arguments);

// Get search term from header
var g_term = (() => {
  for (var i = 0, l = PPx.EntryDisplayCount; i < l; i++) {
    var thisComment = PPx.Entry(i).Comment;

    if (~thisComment.indexOf(TERM_PREFIX)) {
      return thisComment.split(TERM_PREFIX)[1];
    }
  }
})();

// If the search term contains a commit-hash, change to the method for Git-grep
if (/^[0-9a-zA-Z]{7}@@@/.test(g_term)) {
  g_args.method = g_args.method + '_commit';
}

// Load Methods
var initRun = (function (name = g_args.method) {
  var cmd = method[name];

  if (cmd === '') {
    util.quitMsg('Not found ' + name);
  }

  return Function('path', 'shortname', 'number', 'duplicate', 'term', 'return ' + cmd()`);
})();

/* Initial run */
var run = initRun();

/* Subsequent run */
var entries = PPx.Extract('%#;FDC').split(';');
var markCount = PPx.EntryMarkCount;

// Initial value of the loop depending on the mark
var hasMark = !markCount ? 0 : 1;

// For ShortName
var reg = /^[0-9]*/;

// Check for duplicates
var exists = {};

var thisEntry = PPx.Entry();
thisEntry.FirstMark;

var fso = PPx.CreateObject('Scripting.FileSystemObject');

for (var i = hasMark; i <= markCount; i++) {
  if (fso.FileExists(thisEntry.Name)) {
    // Get FullPath
    var path = entries[i - hasMark];

    // Get ShortName
    var sn = thisEntry.ShortName;

    // Get ShortName as a number
    var num = reg.test(sn) ? sn | 0 : 1;

    // Duplicate Entry Identification
    var dup = (() => {
      var isDup = exists[path] || false;
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
