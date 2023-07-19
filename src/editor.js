import {OFFTAG_REGEX_G,concreateLength,toFolioText} from 'ptk';
import {get} from 'svelte/store';
import {dirty,thecm,cursormark,cursorline, folioLines,maxline,activepb} from './store.js';
const juans=[],pbs=[],folios=[];
const regPB=/\^pb(\d+)/;
const Cursormarker='▼';
export const FolioChars=17;
const foliomarks=[];
const getCursorPage=(cm)=>{    
    const last= cm.lineCount();
    if (last==0) return;
    const {line,ch}=cm.getCursor();
    const lines=[];
    let from=line-20;
    let till=line+30;
    let pb=0;
    if (from<0) from=0;
    if (till>last-1) till=last-1;    
    const uppermarks=cm.findMarks({line:from,ch:0},{line,ch}).filter(it=>it.className=='pb')
    const lowermarks=cm.findMarks({line,ch},{line:till,ch:0}).filter(it=>it.className=='pb')
    while (uppermarks.length>1) uppermarks.shift(); //留最接近的
    while (lowermarks.length>1) lowermarks.pop();   //留最接近的
    if (uppermarks.length) {
        const linetext=cm.getLine( uppermarks[0].find().from.line);
        const m=linetext.match(/\^pb(\d+)/);
        if (m) pb=(parseInt(m[1])-1)||0;
        if (pb<0) pb=0;
    }
    if (uppermarks.length && lowermarks.length) {   //一定要有結束的 ^pb
        const start=uppermarks[0].find().from;
        const end=lowermarks[0].find().to;
        for (let i=start.line;i<=end.line;i++) {
            let linetext=cm.getLine(i)
            if (i==line) {
                //加上游標所在
                linetext=linetext.slice(0,ch)+Cursormarker+linetext.slice(ch);
            }
            if (i==end.line) {//先截尾
                linetext=linetext.slice(0,end.ch+1); // 不加一的話，無法包括結束的 ^pb
            }
            if (i==start.line) { //再截頭
                linetext=linetext.slice(start.ch);
            }
            lines.push(linetext);
        }
    }
    return [pb,toFolioText(lines)];
}
export const getMarkPos=(pagetext)=>{
    if (!pagetext || !pagetext.length) return 0;
    let ch=0,line=0;
    for (let i=0;i<pagetext.length;i++) {
        const linetext=pagetext[i];
        const at=linetext.indexOf(Cursormarker);
        if (~at) {
            ch=concreateLength(linetext.slice(0,at));
            line=i;
            break;
        }
    }
    return line*(FolioChars+1)+ch;
}
export const folioLinesAtLine=(cm,line)=>{
    let foliolines=5;//default value
    for (let i=0;i<foliomarks.length;i++) {
        const {from,to}=foliomarks[i].find();
        if (from.line>line) break;
        const linetext=cm.getLine(from.line);
        const offtag=linetext.slice(from.ch, to.ch);
        const m=offtag.match(/lines=(\d+)/);
        if (m) foliolines=parseInt(m[1])||5;
    }
    return foliolines;
}
export const beforeChange=(cm,obj)=>{}
export const afterChange=(cm,obj)=>{}
export const cursorActivity=(cm)=>{
    const [pb,pagetext] = getCursorPage(cm);
    cursormark.set(getMarkPos(pagetext))
    const line=cm.getCursor().line;
    cursorline.set( line);
    activepb.set(pb);
    folioLines.set(folioLinesAtLine(cm,line));
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
    maxline.set(cm.lineCount())
    return lines.length;
}
export const markOfftext=(cm,line)=>{
    const text=cm.getLine(line);
    text.replace(OFFTAG_REGEX_G,(m,m1,m2,ch)=>{   
        if (m1.startsWith('juan')) {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"juan"})
        } else if (m1.startsWith('pb')){
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"pb"})
            const m2=m1.match(/(\d+)/);
        } else if (m1.startsWith('folio')) {
            const foliomark=cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"folio"})
            foliomarks.push(foliomark);
        } else {
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"offtag"})
        }
    });
}
export const setCursorLine=(line)=>{
    const cm=get(thecm);
    if (line<cm.lineCount()) cm.setCursor({line});
    return line;
}

