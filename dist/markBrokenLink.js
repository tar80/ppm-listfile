for(var e=PPx.CreateObject("Scripting.FileSystemObject"),t=PPx.Entry.AllEntry;!t.atEnd();t.moveNext()){var r=t.Name;e.FileExists(r)||e.FolderExists(r)||(t.Mark=1)}
