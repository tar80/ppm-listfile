(function () {
  return {
    gvim: function () {
      PPx.Execute('%Oix *focus #%*findwindowclass("vim"),%g\'gvim\'');
      return function (path, _shortname, number, _duplicate, term) {
        PPx.Execute(
          '%Obd gvim --remote-send "<Cmd>tabe ' + path + '|' + number + '-1 /' + term + '/<CR>"'
        );
      };
    },
    gvim_commit: function () {
      // For Git-grep
      // NOTE: "term" in Git-grep is output as "commit_hash@@@term" (commit_hash is 7 digits),
      // so You can split it like "term.split('@@@')".
      PPx.Execute('%Oix *focus #%*findwindowclass("vim"),%g\'gvim\'');
      var root =
        PPx.Extract('%si"repoRoot"') ||
        PPx.Extract('%*script(%*getcust(S_ppm#global:lib)\\repository.js)').split(',')[1];
      return function (path, _shortname, number, _duplicate, term) {
        PPx.Execute('*wait 100,1');
        var path_ = path.slice(root.length + 1).replace(/\\/g, '/');
        var split_term = term.split('@@@');
        PPx.Execute(
          '%Obd gvim --remote-send "<Cmd>tabnew ' +
            split_term[0] +
            ':' +
            PPx.Extract('%*name(C,' + path_ + ')') +
            "|set bt=nofile|execute 'silent! r! git cat-file -p " +
            split_term[0] +
            ':' +
            path_ +
            "'|0d_|" +
            (number - 1) +
            '/' +
            split_term[1] +
            '/<CR>"'
        );
      };
    },
    ppv: function () {
      return function (path, _shortname, number, duplicate, term) {
        if (!duplicate) {
          PPx.Execute('%Oi *ppv ' + path + ' -k *find ' + term + ' %%: *jumpline L' + number);
          PPx.Execute('*wait 100,1');
        }
      };
    },
    sed: function () {
      // var rep = PPx.Extract(
        // '"s#%*script(%\'scr\'%\\compCode.js,"is","""%%","[検索文字#置換文字] ※\\=\\\\\\\\")#g"'
      // );
      var rep = util.input.call({type: 1, mode: 's', title: 'sed [word#replace] \\=\\\\\\\\'});
      return function (path, _shortname, number, duplicate) {
        if (!duplicate) {
          PPx.Execute('%Oi copy ' + path + ' ' + path + '_back %&');
        }

        PPx.Execute('%Oi sed -i -r ' + number + '"s#' + rep + '#g" ' + path);
      };
    }
  };
})();
/**
 * Methods for executing entries on the Listfile
 *
 * @arg 0 Method to execute
 *
 * ・コマンド毎にオブジェクトcmd[]内に記述する
 *  ・returnより前の部分は初回のみ実行される
 *  ・return以降に以下の引数が使用できる
 *     path       = ファイルパス(リストファイル上のエントリ)
 *     shortname  = ショートネーム(リストファイル上のエントリ)
 *     number     = 行数(shotrnameに設定された数値※ppm-grep用)
 *     duplicate  = 真偽値(重複パス実行)
 *     term       = 検索語
 * ・git grepの検索結果にはコマンド名に'_commit'を付加したコマンドが適用される
 *    例えばgit grepに対してcmd['editor']を実行すると、実際にはcmd['editor_commit']の内容が実行される
 */
