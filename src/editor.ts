import {bsearchNumber,OFFTAG_REGEX_G} from 'ptk';
import {dirty,thecm,cursorline,juan,pb} from './store.js';
import {get} from 'svelte/store';
const juans=[],pbs=[];
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
    cm.setCursor({line});
    return lines.length;
}

export const beforeChange=(cm:CodeMirror,obj)=>{
    const {origin,text,to,from,cancel}=obj;
    if (origin=='setValue') return;
    const cursor=cm.getCursor();
    const marks=cm.doc.findMarksAt(cursor);
    if (marks.length) {
        const markpos=marks[0].find();
        if (markpos.to.ch>cursor.ch) {
            cancel();
            return;    
        }
    }

    if (origin=='+delete') {
        if (to.line==from.line+1 && to.ch==0) {
        } else cancel();
    } else if (origin=='+input') {
        if (text.length==2 && text.join('')=='') {
        } else {
            cancel();
        }
    }
}
export const afterChange=(cm:CodeMirror,obj)=>{
    const {origin,to,from,text} = obj;
    // 
    if (origin=='+delete') { //join
        if (to.line==from.line+1 && to.ch==0) {
            dirty.set(true);
            rebuildJuanPb(cm);
        }
    } else if (origin=='+input') {
        if (text.length==2 && text.join('')=='') {
            dirty.set(true);
            rebuildJuanPb(cm);
        }
    }
}
export const movePb=()=>{

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
    if (cursor.line+1==get(cursorline)) return;
    cursorline.set(cursor.line+1)
    const [a,b]=juanPbAtLine(cursor.line);
    if (get(juan)!==a) juan.set(a);    
    if (get(pb)!==b)   pb.set(b);
}

export const setCursorLine=(line)=>{
    return line;
}

export const keyDown=(cm,e)=>{
    if (!e.ctrlKey ) return;
    
    if (e.key=="ArrowDown"||e.key=="ArrowUp"||e.key=="ArrowRight"||e.key=="ArrowLeft") {
        const m=cm.findMarksAt(cm.getCursor());
        if (m&&m.length &&m[0].className=='pb') {
            //move arround;
            e.preventDefault();
        }
            
    }
}
//control arrow to move pb
