﻿function _construct(t,e,n){if(_isNativeReflectConstruct())return Reflect.construct.apply(null,arguments);var r=[null];r.push.apply(r,e);var i=new(t.bind.apply(t,r));return n&&_setPrototypeOf(i,n.prototype),i}function _setPrototypeOf(t,e){return _setPrototypeOf=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(t,e){return t.__proto__=e,t},_setPrototypeOf(t,e)}function _isNativeReflectConstruct(){try{var t=!Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){})))}catch(t){}return(_isNativeReflectConstruct=function(){return!!t})()}var validArgs=function(){for(var t=[],e=PPx.Arguments;!e.atEnd();e.moveNext())t.push(e.value);return t},safeArgs=function(){for(var t=[],e=validArgs(),n=0,r=arguments.length;n<r;n++)t.push(_valueConverter(n<0||arguments.length<=n?undefined:arguments[n],e[n]));return t},_valueConverter=function(t,e){if(null==e||""===e)return null!=t?t:undefined;switch(typeof t){case"number":var n=Number(e);return isNaN(n)?t:n;case"boolean":return null!=e&&"false"!==e&&"0"!==e;default:return e}},t={ppmName:"ppx-plugin-manager",ppmVersion:.95,language:"ja",encode:"utf16le",nlcode:"\r\n",nltype:"crlf",ppmID:"P",ppmSubID:"Q"},e={actions:"S_ppm#actions",event:"S_ppm#event",global:"S_ppm#global",sources:"S_ppm#sources",staymode:"S_ppm#staymode",user:"S_ppm#user"},useLanguage=function(){var n=PPx.Extract("%*getcust("+e.global+":lang)");return"en"===n||"ja"===n?n:t.language},isEmptyStr=function(t){return""===t},isEmptyObj=function(t){if(t===undefined)return!1;if(null===t)return!0;for(var e in t)return!1;return!0},isInteger=function(t){return"number"==typeof t&&isFinite(t)&&Math.floor(t)===t},n=PPx.CreateObject("Scripting.FileSystemObject"),r={TypeToCode:{crlf:"\r\n",cr:"\r",lf:"\n"},CodeToType:{"\r\n":"crlf","\r":"cr","\n":"lf"},Ppx:{lf:"%%bl",cr:"%%br",crlf:"%%bn",unix:"%%bl",mac:"%%br",dos:"%%bn","\n":"%%bl","\r":"%%br","\r\n":"%%bn"},Ascii:{lf:"10",cr:"13",crlf:"-1",unix:"10",mac:"13",dos:"-1","\n":"10","\r":"13","\r\n":"-1"}},expandNlCode=function(t){var e="\n",n=t.indexOf("\r");return~n&&(e="\r\n"===t.substring(n,n+2)?"\r\n":"\r"),e},isCV8=function(){return"ClearScriptV8"===PPx.ScriptEngineName},confirmFileEncoding=function(e){return"utf8"===e||"sjis"===e?e:t.encode},_exec=function(t,e){try{var n;return[!1,null!=(n=e())?n:""]}catch(r){return[!0,""]}finally{t.Close()}},read=function(t){var e=t.path,r=t.enc,i=void 0===r?"utf8":r;if(!n.FileExists(e))return[!0,e+" not found"];var o=n.GetFile(e);if(0===o.Size)return[!0,e+" has no data"];var u=!1,a="";if("utf8"===i){var l=PPx.CreateObject("ADODB.Stream"),c=_exec(l,(function(){return l.Open(),l.Charset="UTF-8",l.LoadFromFile(e),l.ReadText(-1)}));u=c[0],a=c[1]}else{var s="utf16le"===i?-1:0,p=o.OpenAsTextStream(1,s),d=_exec(p,(function(){return p.ReadAll()}));u=d[0],a=d[1]}return u?[!0,"Unable to read "+e]:[!1,a]},readLines=function(t){var e,n=t.path,r=t.enc,i=void 0===r?"utf8":r,o=t.linefeed,u=read({path:n,enc:i}),a=u[0],l=u[1];if(a)return[!0,l];o=null!=(e=o)?e:expandNlCode(l.slice(0,1e3));var c=l.split(o);return isEmptyStr(c[c.length-1])&&c.pop(),[!1,{lines:c,nl:o}]},writeLines=function(e){var i=e.path,o=e.data,u=e.enc,a=void 0===u?"utf8":u,l=e.append,c=void 0!==l&&l,s=e.overwrite,p=void 0!==s&&s,d=e.linefeed,v=void 0===d?t.nlcode:d;if(!p&&!c&&n.FileExists(i))return[!0,i+" already exists"];var g,y=n.GetParentFolderName(i);if(n.FolderExists(y)||PPx.Execute("*makedir "+y),"utf8"===a){if(isCV8()){var h=o.join(v),m=c?"AppendAllText":"WriteAllText";return[!1,NETAPI.System.IO.File[m](i,h)]}var b=p||c?2:1,S=PPx.CreateObject("ADODB.Stream");g=_exec(S,(function(){S.Open(),S.Charset="UTF-8",S.LineSeparator=Number(r.Ascii[v]),c?(S.LoadFromFile(i),S.Position=S.Size,S.SetEOS):S.Position=0,S.WriteText(o.join(v),1),S.SaveToFile(i,b)}))[0]}else{var P=c?8:p?2:1;n.FileExists(i)||PPx.Execute("%Osq *makefile "+i);var x="utf16le"===a?-1:0,O=n.GetFile(i).OpenAsTextStream(P,x);g=_exec(O,(function(){O.Write(o.join(v)+v)}))[0]}return g?[!0,"Could not write to "+i]:[!1,""]};Array.prototype.removeEmpty||(Array.prototype.removeEmpty=function(){for(var t=[],e=0,n=this.length;e<n;e++){var r=this[e];null==r||""===r||r instanceof Array&&0===r.length||r instanceof Object&&isEmptyObj(r)||t.push(r)}return t}),function(){if("object"!=typeof JSON){JSON={};var t,e,n,r,i=/^[\],:{}\s]*$/,o=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,u=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,a=/(?:^|:|,)(?:\s*\[)+/g,l=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,c=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":"Invalid Date"}),"function"!=typeof JSON.stringify&&(n={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(n,i,o){var u;if(t="",e="","number"==typeof o)for(u=0;u<o;u+=1)e+=" ";else"string"==typeof o&&(e=o);if(r=i,i&&"function"!=typeof i&&("object"!=typeof i||"number"!=typeof i.length))throw new Error("JSON.stringify");return str("",{"":n})}),"function"!=typeof JSON.parse&&(JSON.parse=function(t,e){var n;function walk(t,n){var r,i,o=t[n];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&((i=walk(o,r))!==undefined?o[r]=i:delete o[r]);return e.call(t,n,o)}if(t=String(t),c.lastIndex=0,c.test(t)&&(t=t.replace(c,(function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)}))),i.test(t.replace(o,"@").replace(u,"]").replace(a,"")))return n=Function("return ("+t+")")(),"function"==typeof e?walk({"":n},""):n;throw new Error("JSON.parse")})}function f(t){return t<10?"0"+t:t}function quote(t){return l.lastIndex=0,l.test(t)?'"'+t.replace(l,(function(t){var e=n[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)}))+'"':'"'+t+'"'}function str(n,i){var o,u,a,l,c,s=t,p=i[n];switch(p&&"object"==typeof p&&"function"==typeof p.toJSON&&(p=p.toJSON(n)),"function"==typeof r&&(p=r.call(i,n,p)),typeof p){case"string":return quote(p);case"number":return isFinite(p)?String(p):"null";case"boolean":return String(p);case"object":if(!p)return"null";if(t+=e,c=[],"[object Array]"===Object.prototype.toString.apply(p)){for(l=p.length,o=0;o<l;o+=1)c[o]=str(String(o),p)||"null";return a=0===c.length?"[]":t?"[\n"+t+c.join(",\n"+t)+"\n"+s+"]":"["+c.join(",")+"]",t=s,a}if(r&&"object"==typeof r)for(l=r.length,o=0;o<l;o+=1)"string"==typeof r[o]&&(a=str(u=String(r[o]),p))&&c.push(quote(u)+(t?": ":":")+a);else for(u in p)Object.prototype.hasOwnProperty.call(p,u)&&(a=str(u,p))&&c.push(quote(u)+(t?": ":":")+a);return a=0===c.length?"{}":t?"{\n"+t+c.join(",\n"+t)+"\n"+s+"}":"{"+c.join(",")+"}",t=s,a}return"null"}}();var dateToBit=function(){for(var t,e=arguments.length,n=new Array(e),r=0;r<e;r++)n[r]=arguments[r];if(1===n.length)t=n[0];else{var i=n[0],o=n[1],u=n.slice(2);t=_construct(Date,[i,o-1].concat(u)).getTime()}var a=(.001*t+11644473600)/1e-7/Math.pow(2,32),l=Math.floor(a);return{high:l,low:(a-l)*Math.pow(2,32)}},getFiletime=function(t){var e,n=[],r=null!=(e=t.split(","))?e:[0];if(~t.indexOf("."))return t;for(var i=0;i<r.length;i++){var o=r[i];n.push(Number(o))}var u=dateToBit.apply(void 0,n);return u.high+"."+u.low},_localDate=function(t){return t.getFullYear()+","+String(t.getMonth()+1).padStart(2,"0")+","+String(t.getDate()).padStart(2,"0")+","+String(t.getHours()).padStart(2,"0")+","+String(t.getMinutes()).padStart(2,"0")+","+String(t.getSeconds()).padStart(2,"0")},_rangeProp=function(t,e,n,r){return isInteger(e)&&n<=e&&e<=r?","+t+":"+e:""},buildLfItem=function(t){var e=t.name,n=t.sname,r=void 0===n?"":n,i=t.att,o=void 0===i?0:i,u=t.date,a=t.ext,l=t.hl,c=t.mark,s=t.comment;if(e&&!isEmptyStr(e)){u||(u=_localDate(new Date)),Number.isNaN(o)&&(o=0);var p=getFiletime(u);return'"'+e+'","'+r+'",A:H'+o+",C:"+p+",L:"+p+",W:"+p+",S:0.0"+(isInteger(a)?",X:"+a:"")+_rangeProp("H",l,1,7)+_rangeProp("M",c,-1,1)+(s?',T:"'+s.replace(/"/g,'""')+'"':"")}},_dotEntries=function(){var t=PPx.Extract("%*getcust(XC_tdir)").split(","),e=t[0],n=t[1];return Number(e)+Number(n)},getIndex=function(t){for(var e=0;t.length>e&&0===t[e].indexOf(";");)e++;return PPx.Entry.Index+_dotEntries()+e},i={en:{notListFile:"Not a ListFile",subTitle:"Head [n:] is att. n: 1=R 2=H 4=S 8=L 10=D"},ja:{notListFile:"リストファイルではありません",subTitle:"行頭[n:]は属性値 n: 1=R 2=H 4=S 8=L 10=D"}}[useLanguage()],main=function(){var e=safeArgs(undefined,t.encode),n=e[0],r=e[1],o=PPx.DirectoryType,u=4===o?PPx.Extract("%FDV").replace("::listfile",""):n;u||(PPx.linemessage('!"'+i.notListFile),PPx.Quit(-1));var a=noteEntry(),l=a[0],c=a[1];if(!isEmptyStr(c)){var s=buildLfItem({name:c,att:l});if(s){var p,d,v=confirmFileEncoding(r);if(4===o){var g=readLines({path:u,enc:v,linefeed:t.nlcode}),y=g[0],h=g[1];y&&(PPx.linemessage('!"'+h),PPx.Quit(-1)),h.lines.splice(getIndex(h.lines),0,s);var m=writeLines({path:u,data:h.lines,enc:v,overwrite:!0,linefeed:h.nl});p=m[0],d=m[1]}else{var b=writeLines({path:u,data:[s],enc:v,append:!0,linefeed:t.nlcode});p=b[0],d=b[1]}p&&(PPx.linemessage('!"'+d),PPx.Quit(-1)),4===o&&(PPx.Execute("*wait 100,1%:*jumppath -savelocate"),PPx.Entry.State=4)}}},noteEntry=function(){var t="'title':'Note  "+i.subTitle+"','mode':'e','leavecancel':true,'list':'off','module':'off'",e=PPx.Extract('%*script("%sgu\'ppmlib\'\\input.js","{'+t+'}")');if("[error]"===e||isEmptyStr(e))return[0,""];var n="#=8=#",r=e.replace(/^((\d+):\s*)?(.+)$/,"$2"+n+"$3").split(n),o=r[0],u=r[1];return[Number(o),u.replace(/"/g,"`")]};main();
