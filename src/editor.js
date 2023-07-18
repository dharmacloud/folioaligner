import {OFFTAG_REGEX_G,toFolioText} from 'ptk';
import {get} from 'svelte/store';
import {dirty,thecm} from './store.js';
const juans=[],pbs=[],folios=[];
const regPB=/\^pb(\d+)/;
const getCursorPage=(cm)=>{    
    const last= cm.lineCount();
    if (last==0) return;
    console.log(last)
    const {line,ch}=cm.getCursor();
    const lines=[];
    let from=line-20;
    let till=line+30;
    if (from<0) from=0;
    if (till>last-1) till=last-1;

    
    const uppermarks=cm.findMarks({line:from,ch:0},{line,ch}).filter(it=>it.className=='pb')
    const lowermarks=cm.findMarks({line,ch},{line:till,ch:0}).filter(it=>it.className=='pb')

    while (uppermarks.length>1){
        uppermarks.shift();
    } 
    while (lowermarks.length>1) lowermarks.pop();
    if (uppermarks.length && lowermarks.length) {
        const start=uppermarks[0].find().from;
        const end=lowermarks[0].find().to;
        for (let i=start.line;i<=end.line;i++) {
            let linetext=cm.getLine(i)
            if (i==end.line) {//先截尾
                linetext=linetext.slice(0,end.ch);
            }
            if (i==start.line) { //再截頭
                linetext=linetext.slice(start.ch);
            }
            lines.push(linetext);
        }
    }
    return toFolioText(lines);
}

export const beforeChange=(cm,obj)=>{}
export const afterChange=(cm,obj)=>{}
export const cursorActivity=(cm)=>{
    const page=getCursorPage(cm);
    console.log(page);
}
export const touchtext=(cb)=>{
    const cm=get(thecm);
    cm.off("beforeChange",beforeChange);
    cm.operation(cb);
    cm.on("beforeChange",beforeChange);    
}
export const keyDown=(cm,e)=>{}
export const loadCMText=(text)=>{
    const cm=get(thecm);
    const line=cm.getCursor().line;
    cm.doc.setValue(text);
    const lines=text.split('\n');
    juans.length=0;
    pbs.length=0;
    folios.length=0;
    cm.operation(()=>{
        for (let i=0;i<lines.length;i++) markOfftext( cm, i);
    });
    if (line<=cm.lineCount()) cm.setCursor({line});
    return lines.length;
}
export const markOfftext=(cm,line)=>{
    const text=cm.getLine(line);
    text.replace(OFFTAG_REGEX_G,(m,m1,m2,ch)=>{   
        if (m1.startsWith('juan')) {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"juan"})
        } else if (m1.startsWith('pb')){
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"pb"})
        } else if (m1.startsWith('folio')) {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"folio"})
        } else {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"offtag"})
        }
    });
}
export const setCursorLine=(line)=>{
    const cm=get(thecm);
    if (line<cm.lineCount()) cm.setCursor(line);
    return line;
}

