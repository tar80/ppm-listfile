﻿var validArgs=function(){for(var e=[],r=PPx.Arguments;!r.atEnd();r.moveNext())e.push(r.value);return e},safeArgs=function(){for(var e=[],r=validArgs(),n=0,t=arguments.length;n<t;n++)e.push(_valueConverter(n<0||arguments.length<=n?undefined:arguments[n],r[n]));return e},_valueConverter=function(e,r){if(null==r||""===r)return null!=e?e:undefined;switch(typeof e){case"number":var n=Number(r);return isNaN(n)?e:n;case"boolean":return"false"!==r&&"0"!==r&&null!=r;default:return r}},e={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},useLanguage=function(){var r=PPx.Extract("%*getcust(S_ppm#global:lang)");return"en"===r||"ja"===r?r:e.language},r=PPx.CreateObject("Scripting.FileSystemObject"),isEmptyStr=function(e){return""===e},isZero=function(e){return"string"==typeof e?"0"===e:0===e},expandNlCode=function(e){var r="\n",n=e.indexOf("\r");return~n&&(r="\r\n"==e.substring(n,n+2)?"\r\n":"\r"),r},isCV8=function(){return"ClearScriptV8"===PPx.ScriptEngineName},n={TypeToCode:{crlf:"\r\n",cr:"\r",lf:"\n"},CodeToType:{"\r\n":"crlf","\r":"cr","\n":"lf"},Ppx:{lf:"%%bl",cr:"%%br",crlf:"%%bn",unix:"%%bl",mac:"%%br",dos:"%%bn","\n":"%%bl","\r":"%%br","\r\n":"%%bn"},Ascii:{lf:"10",cr:"13",crlf:"-1",unix:"10",mac:"13",dos:"-1","\n":"10","\r":"13","\r\n":"-1"}},exec=function(e,r){try{var n;return[!1,null!=(n=r())?n:""]}catch(t){return[!0,""]}finally{e.Close()}},read=function(e){var n=e.path,t=e.enc,i=void 0===t?"utf8":t;if(!r.FileExists(n))return[!0,n+" not found"];var a=r.GetFile(n);if(0===a.Size)return[!0,n+" has no data"];var l=!1,o="";if("utf8"===i){var u=PPx.CreateObject("ADODB.Stream"),c=exec(u,(function(){return u.Open(),u.Charset="UTF-8",u.LoadFromFile(n),u.ReadText(-1)}));l=c[0],o=c[1]}else{var f="utf16le"===i?-1:0,d=a.OpenAsTextStream(1,f),s=exec(d,(function(){return d.ReadAll()}));l=s[0],o=s[1]}return l?[!0,"Unable to read "+n]:[!1,o]},readLines=function(e){var r,n=e.path,t=e.enc,i=void 0===t?"utf8":t,a=e.linefeed,l=read({path:n,enc:i}),o=l[0],u=l[1];if(o)return[!0,u];a=null!=(r=a)?r:expandNlCode(u.slice(0,1e3));var c=u.split(a);return isEmptyStr(c[c.length-1])&&c.pop(),[!1,{lines:c,nl:a}]},writeLines=function(t){var i=t.path,a=t.data,l=t.enc,o=void 0===l?"utf8":l,u=t.append,c=void 0!==u&&u,f=t.overwrite,d=void 0!==f&&f,s=t.linefeed,p=void 0===s?e.nlcode:s;if(!d&&!c&&r.FileExists(i))return[!0,i+" already exists"];var x,P=r.GetParentFolderName(i);if(r.FolderExists(P)||PPx.Execute("*makedir "+P),"utf8"===o){if(isCV8()){var m=a.join(p),v=c?"AppendAllText":"WriteAllText";return[!1,NETAPI.System.IO.File[v](i,m)]}var E=d||c?2:1,g=PPx.CreateObject("ADODB.Stream");x=exec(g,(function(){g.Open(),g.Charset="UTF-8",g.LineSeparator=Number(n.Ascii[p]),c?(g.LoadFromFile(i),g.Position=g.Size,g.SetEOS):g.Position=0,g.WriteText(a.join(p),1),g.SaveToFile(i,E)}))[0]}else{var b=c?8:d?2:1;r.FileExists(i)||PPx.Execute("%Osq *makefile "+i);var F="utf16le"===o?-1:0,y=r.GetFile(i).OpenAsTextStream(b,F);x=exec(y,(function(){y.Write(a.join(p)+p)}))[0]}return x?[!0,"Could not write to "+i]:[!1,""]},fileEnc=function(r){return"utf8"===r||"sjis"===r?r:e.encode},t={en:{failedRewrite:"Failed to rewrite",couldNotRead:"Could not read ListFile",couldNotGetEntry:"Could not get entry information",rename:"Undoable rename"},ja:{failedRewrite:"書き換えに失敗しました",couldNotRead:"リストファイルを読み込めませんでした",couldNotGetEntry:"エントリ情報を取得できませんでした",rename:"名前変更(Undo有効)"}}[useLanguage()],main=function(){var n=safeArgs(!1,e.encode),i=n[0],a=n[1],l=PPx.DirectoryType;if(PPx.EntryState<2&&PPx.Quit(-1),4!==l)return l;var o=PPx.Extract("%FDCN"),u=fileEnc(a);if(r.FileExists(o)||r.FolderExists(o))return doRename(i),4;var c=PPx.Extract('%*input("%C" -title:"Rename" -mode:Ec -k *cursor -8%%:*mapkey use,K_ppmRename)'),f=PPx.Extract();if(!isZero(f)||isEmptyStr(c))return 4;var d=PPx.Extract("%FDV"),s=readLines({path:d,enc:u,linefeed:e.nlcode}),p=s[0],x=s[1];p&&(PPx.linemessage('!"'+t.couldNotRead),PPx.Quit(-1));for(var P=PPx.Extract("%R"),m=/^"[^"]+",(.+)$/,v=0,E=x.lines.length;v<E;v++){var g=x.lines[v];1===g.indexOf(P)&&(x.lines[v]=g.replace(m,'"'+c+'",$1'))}var b=writeLines({path:d,data:x.lines,enc:u,overwrite:!0,linefeed:x.nl}),F=b[0],y=b[1];return F&&(PPx.linemessage('!"'+y),PPx.Quit(-1)),PPx.Execute('*wait 100,1%:*jumppath -entry:"'+c+'"'),4},doRename=function(e){var r=e?'*ppcfile !rename -min -same:skip -error:dialog -undolog:on -log:off -name:"%*input("%C" -title:"'+t.rename+'" -mode:Ec -k *cursor -8%%:*mapkey use,K_ppmRename)"':'%K"@R"';PPx.Execute(r)};PPx.result=main();
