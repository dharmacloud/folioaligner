import {bsearchNumber,OFFTAG_REGEX_G} from 'ptk';
import {dirty,thecm,cursorline,juan,pb,replacing} from './store.js';
import {get} from 'svelte/store';
const juans=[],pbs=[];
let rebuildneeded=false;
export const markOfftext=(cm,line)=>{
    const text=cm.getLine(line);
    text.replace(OFFTAG_REGEX_G,(m,m1,m2,ch)=>{   
        if (m1.startsWith('juan')) {
            juans.push(line);
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"juan"})
        } else if (m1.startsWith('pb')){
            pbs.push(line);
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"pb"})
        } else {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"offtag"})
        }
    });
}
export const rebuildJuanPb=(cm)=>{
    if (!rebuildneeded)return;
    console.log('rebuild pb')
    juans.length=0;
    pbs.length=0;
    for (let line=0;line<cm.lineCount();line++) {
        const text=cm.getLine(line);
        text.replace(OFFTAG_REGEX_G,(m,m1,m2,ch)=>{   
            if (m1.startsWith('juan')) {
                juans.push(line);
            } else if (m1.startsWith('pb')){
                pbs.push(line);
            }
        });
    }
    rebuildneeded=false;
}
export const loadCMText=(text)=>{
    const cm=get(thecm);
    const line=cm.getCursor().line;
    cm.doc.setValue(text);
    const lines=text.split('\n');
    juans.length=0;
    pbs.length=0;
    cm.operation(()=>{
        for (let i=0;i<lines.length;i++) markOfftext( cm, i);
    });
    if (line<=cm.lineCount()) cm.setCursor({line});
    return lines.length;
}
const isdeletespace=(cm,from,to)=>{
    if (from.line==to.line && Math.abs(from.ch-to.ch)==1 ) {
        const line=cm.getLine(from.line)
        const ch=Math.min(from.ch,to.ch);
        return line.charAt(ch)=='　';
    }
}
const isinsertspace=(cm,text)=>{
    if (text.length==1 && (text[0]==' '||text[0]=='　')) {
        if (text[0]==' ') text[0]='　';
        return true;
    }
}
export const beforeChange=(cm:CodeMirror,obj)=>{
    const {origin,text,to,from,cancel}=obj;
    if (origin=='setValue'||!origin) return;
    const cursor=cm.getCursor();
    const marks=cm.doc.findMarksAt(cursor);
    if (marks.length) {
        const markpos=marks[0].find();
        if (markpos.to.ch>cursor.ch&&markpos.from.ch<cursor.ch) {//should not split tag
            cancel();
            return;    
        }
    }

    if (origin=='+delete') {
        if (to.line==from.line+1 && to.ch==0) {
        } else if (isdeletespace(cm,from,to)){ //allow delete space
        } else cancel();
    } else if (origin=='+input') {
        if (text.length==2 && text.join('')=='') {
        } else if (isinsertspace(cm,text)){
        } else {
            cancel();
        }
    }
}
export const afterChange=(cm:CodeMirror,obj)=>{
    const {origin,to,from,text} = obj;
    
    if (origin=='+delete') { //join
        if (to.line==from.line+1 && to.ch==0) {
            rebuildJuanPb(cm);
        }
        dirty.set(true);
    } else if (origin=='+input') {
        if (text.length==2 && text.join('')=='') {
            dirty.set(true);
            rebuildJuanPb(cm);
        }
    } else {
        rebuildJuanPb(cm);
    }
}

export const movePb=(cm,e)=>{
    const key=e.key.toLowerCase();
    const cursor=cm.getCursor();
    let linetext=cm.getLine(cursor.line);
    let at=cursor.ch;
    while (linetext.charAt(at)!=='^' && at>0) at--;
    linetext=linetext.slice(0,at)+linetext.slice(at+3);
    
    if (key=='arrowdown') {
        if (cursor.line<cm.lineCount()) {
            let nexttext=cm.getLine(cursor.line+1);
            nexttext='^pb'+nexttext;
            cm.doc.replaceRange( linetext+'\n'+nexttext,{line:cursor.line,ch:0},{line:cursor.line+1,ch:nexttext.length-3})
            rebuildneeded=true;
            setTimeout(()=>{
                markOfftext(cm,cursor.line+1);
                cm.setCursor({line:cursor.line+1,ch:0});
            },10)
        }
    } else if(key=='arrowup') {
        if (cursor.line>0) {
            let prevtext=cm.getLine(cursor.line-1);
            prevtext='^pb'+prevtext;
            rebuildneeded=true;
            cm.doc.replaceRange( prevtext+'\n'+linetext,{line:cursor.line-1,ch:0},{line:cursor.line,ch:linetext.length-3})
            setTimeout(()=>{
                markOfftext(cm,cursor.line-1)
                cm.setCursor({line:cursor.line-1,ch:0})
            },10)
        }        
    } else if (key=='arrowleft'||key=='arrowright'){
        if (key=='arrowleft'&&at>0) {
            at--;
            const cp=linetext.charAt(at);
            if (at>0&&cp>=0xd800&&cp<=0xdfff) at--;
        } else if (at<linetext.length&&key=='arrowright') {
            at++;
            const cp=linetext.charAt(at);
            if (at>0&&cp>=0xd800&&cp<=0xdfff) at++;
        }
        linetext=linetext.slice(0,at)+'^pb'+linetext.slice(at);
        cm.doc.replaceRange(linetext,{line:cursor.line,ch:0},{line:cursor.line,ch:cm.getLine(cursor.line).length})
        setTimeout(()=>{
            markOfftext(cm,cursor.line)
            cm.setCursor({line:cursor.line,ch:at+(key=='arrowright'?3:0)})
        },10)
    }
    
}
export const juanPbAtLine=(line)=>{
    const juan=bsearchNumber(juans,line+1);
    const at=bsearchNumber(pbs,line+1);
    
    const at2=bsearchNumber(pbs, juans[juan-1])
    const pb=at-at2;
    return [juan,pb];
}
export const lineOfJuanPb=(juan,pb)=>{
    const juanstart=juans[juan-1];
    const at=bsearchNumber(pbs, juanstart);
    return pbs[pb+at-1];
}
export const cursorActivity=(cm:CodeMirror)=>{
    const cursor=cm.getCursor();
    const sel=cm.doc.getSelection();
    replacing.set(!!sel);

    if (cursor.line+1==get(cursorline)) return;
    cursorline.set(cursor.line+1)
    const [a,b]=juanPbAtLine(cursor.line);
    if (get(juan)!==a) juan.set(a);    
    if (get(pb)!==b)   pb.set(b);

}

export const setCursorLine=(line)=>{
    const cm=get(thecm);
    if (line<cm.lineCount()) cm.setCursor(line);
    return line;
}

export const keyDown=(cm,e)=>{
    if (!e.ctrlKey ) return;
    
    if (e.key=="ArrowDown"||e.key=="ArrowUp"||e.key=="ArrowRight"||e.key=="ArrowLeft") {
        const m=cm.findMarksAt(cm.getCursor());
        if (m&&m.length &&m[0].className=='pb') {
            movePb(cm,e);
            e.preventDefault();
        }
            
    }
}
//control arrow to move pb
