﻿var e={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},useLanguage=function(){var t=PPx.Extract("%*getcust(S_ppm#global:lang)");return"en"===t||"ja"===t?t:e.language},t=PPx.CreateObject("Scripting.FileSystemObject"),expandNlCode=function(e){var t="\n",n=e.indexOf("\r");return~n&&(t="\r\n"==e.substring(n,n+2)?"\r\n":"\r"),t},isCV8=function(){return"ClearScriptV8"===PPx.ScriptEngineName},isEmptyStr=function(e){return""===e},isZero=function(e){return"string"==typeof e?"0"===e:0===e},withinRange=function(e,t){return 0<=e&&e<=t},n={TypeToCode:{crlf:"\r\n",cr:"\r",lf:"\n"},CodeToType:{"\r\n":"crlf","\r":"cr","\n":"lf"},Ppx:{lf:"%%bl",cr:"%%br",crlf:"%%bn",unix:"%%bl",mac:"%%br",dos:"%%bn","\n":"%%bl","\r":"%%br","\r\n":"%%bn"},Ascii:{lf:"10",cr:"13",crlf:"-1",unix:"10",mac:"13",dos:"-1","\n":"10","\r":"13","\r\n":"-1"}},exec=function(e,t){try{var n;return[!1,null!=(n=t())?n:""]}catch(r){return[!0,""]}finally{e.Close()}},read=function(e){var n=e.path,r=e.enc,i=void 0===r?"utf8":r;if(!t.FileExists(n))return[!0,n+" not found"];var a=t.GetFile(n);if(0===a.Size)return[!0,n+" has no data"];var l=!1,o="";if("utf8"===i){var u=PPx.CreateObject("ADODB.Stream"),c=exec(u,(function(){return u.Open(),u.Charset="UTF-8",u.LoadFromFile(n),u.ReadText(-1)}));l=c[0],o=c[1]}else{var f="utf16le"===i?-1:0,d=a.OpenAsTextStream(1,f),s=exec(d,(function(){return d.ReadAll()}));l=s[0],o=s[1]}return l?[!0,"Unable to read "+n]:[!1,o]},readLines=function(e){var t,n=e.path,r=e.enc,i=void 0===r?"utf8":r,a=e.linefeed,l=read({path:n,enc:i}),o=l[0],u=l[1];if(o)return[!0,u];a=null!=(t=a)?t:expandNlCode(u.slice(0,1e3));var c=u.split(a);return isEmptyStr(c[c.length-1])&&c.pop(),[!1,{lines:c,nl:a}]},writeLines=function(r){var i=r.path,a=r.data,l=r.enc,o=void 0===l?"utf8":l,u=r.append,c=void 0!==u&&u,f=r.overwrite,d=void 0!==f&&f,s=r.linefeed,x=void 0===s?e.nlcode:s;if(!d&&!c&&t.FileExists(i))return[!0,i+" already exists"];var P,p=t.GetParentFolderName(i);if(t.FolderExists(p)||PPx.Execute("*makedir "+p),"utf8"===o){if(isCV8()){var v=a.join(x),m=c?"AppendAllText":"WriteAllText";return[!1,NETAPI.System.IO.File[m](i,v)]}var g=d||c?2:1,E=PPx.CreateObject("ADODB.Stream");P=exec(E,(function(){E.Open(),E.Charset="UTF-8",E.LineSeparator=Number(n.Ascii[x]),c?(E.LoadFromFile(i),E.Position=E.Size,E.SetEOS):E.Position=0,E.WriteText(a.join(x),1),E.SaveToFile(i,g)}))[0]}else{var b=c?8:d?2:1;t.FileExists(i)||PPx.Execute("%Osq *makefile "+i);var h="utf16le"===o?-1:0,F=t.GetFile(i).OpenAsTextStream(b,h);P=exec(F,(function(){F.Write(a.join(x)+x)}))[0]}return P?[!0,"Could not write to "+i]:[!1,""]},validArgs=function(){for(var e=[],t=PPx.Arguments;!t.atEnd();t.moveNext())e.push(t.value);return e},fileEnc=function(t){return"utf8"===t||"sjis"===t?t:e.encode},keepState=function(e,t,n){var r=/^(.+S:[\d\.]+)(,R:[\d\.]+)?(X:\d+)?(H:\d+)?(M:(-1|0|1))?(,T:"(.+)")?(.*)$/;return e.replace(r,"$1$2$3"+t+n+"$7$9")},r={en:{failedRewrite:"Failed to rewrite",couldNotRead:"Could not read ListFile",couldNotGetEntry:"Could not get entry information",rename:"Undoable rename"},ja:{failedRewrite:"書き換えに失敗しました",couldNotRead:"リストファイルを読み込めませんでした",couldNotGetEntry:"エントリ情報を取得できませんでした",rename:"名前変更(Undo有効)"}}[useLanguage()],main=function(){var t=validArgs()[0],n=PPx.Extract("%FDV").replace("::listfile","");0!==PPx.Execute('%K"@w"')&&(PPx.linemessage('!"'+r.failedRewrite),PPx.Quit(-1));var i=fileEnc(t),a=readLines({path:n,enc:i,linefeed:e.nlcode}),l=a[0],o=a[1];l&&(PPx.linemessage('!"'+r.couldNotRead),PPx.Quit(-1));for(var u=PPx.Entry.AllEntry;!u.atEnd();u.moveNext()){var c=u.Highlight>0&&withinRange(u.Highlight,7)?",H:"+u.Highlight:"",f=isZero(u.Mark)?"":",M:1";if(!isEmptyStr(c)||!isEmptyStr(f))for(var d=0,s=o.lines.length;d<s;d++){var x=o.lines[d];~x.indexOf(u.Name)&&(o.lines[d]=keepState(x,c,f))}}var P=writeLines({path:n,data:o.lines,enc:i,linefeed:o.nl,overwrite:!0}),p=P[0],v=P[1];p&&(PPx.linemessage('!"'+v),PPx.Quit(-1)),ignoreSaveComment()},ignoreSaveComment=function(){var e="XC_cwrt",t="ppm_lf_update",n="KC_main:LOADEVENT",r=PPx.Extract("%*getcust("+e+")");PPx.Execute("*setcust "+e+"=0"),PPx.Execute("*linecust "+t+","+n+",*setcust "+e+"="+r+"%%:*linecust "+t+","+n+",")};main();
