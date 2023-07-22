import {OFFTAG_REGEX_G,concreateLength,toFolioText,CJKRangeName} from 'ptk';
import {get} from 'svelte/store';
import {dirty,canedit,thecm,cursormark,cursorchar,cursorline, folioLines,maxline,
    maxjuan,activepb, activefolioid, editfreely} from './store.js';
const pbs=[];
const regPB=/\^pb(\d+)/;
const Cursormarker='▼';
export const FolioChars=17;
const foliomarks=[];


const getRangeText=(cm,start,end,line,ch,addmarker)=>{
    const lines=[]
    for (let i=start.line;i<=end.line;i++) {
        let linetext=cm.getLine(i)||'';
        if (i==line) {
            //加上游標所在
            if (addmarker) linetext=linetext.slice(0,ch)+Cursormarker+linetext.slice(ch);
        }
        if (i==end.line) {//先截尾
            linetext=linetext.slice(0,end.ch+1); // 不加一的話，無法包括結束的 ^pb
        }
        if (i==start.line) { //再截頭
            linetext=linetext.slice(start.ch);
        }
        lines.push(linetext);
    }
    return lines;
}
const getCursorPage=(cm,addmarker=false)=>{    
    const last= cm.lineCount();
    if (last==0) return;
    const {line,ch}=cm.getCursor();
    let lines=[];
    let from=line-100;
    let till=line+100;
    let pb=0, pbindex=0;
    if (from<0) from=0;
    if (till>last-1) till=last-1;    
    const uppermarks=cm.findMarks({line:from,ch:0},{line,ch}).filter(it=>it.className=='pb')
    const lowermarks=cm.findMarks({line,ch},{line:till,ch:0}).filter(it=>it.className=='pb')
    while (uppermarks.length>1) uppermarks.shift(); //留最接近的
    while (lowermarks.length>1) lowermarks.pop();   //留最接近的
    if (uppermarks.length) {
        const markpos=uppermarks[0].find();
        const linetext=cm.getLine( markpos.from.line);
        const m=linetext.match(/\^pb(\d+)/);
        if (m) pb=(parseInt(m[1])-1)||0;
        if (pb<0) pb=0;
        pbindex=cm.indexFromPos(markpos.from);
    
        
        const start=uppermarks[0].find().from;
        const end=lowermarks.length?lowermarks[0].find().to: {line: start.line+10,ch:0 };
        lines=getRangeText(cm,start,end,line,ch,addmarker);
    }
    for (let i=0;i<lines.length;i++) {
        linetext=lines[i];
        if (~linetext.indexOf('^gatha')) {
            lines[i]=linetext.replace(/[，。！？；]/g,'　');
        }
    }
    let foliolines=toFolioText(lines);
    foliolines=foliolines.join('\n').replace(/[（【][^】]+[）】]/,'').split('\n');
    return [pb,foliolines,pbindex];
}
export const getMarkPos=(pagetext)=>{
    if (!pagetext || !pagetext.length) return 0;
    let ch=0,line=0,thechar='';
    for (let i=0;i<pagetext.length;i++) {
        const linetext=pagetext[i];
        let at=linetext.indexOf(Cursormarker);
        if (~at) {
            ch=concreateLength(linetext.slice(0,at));
            while (at>1 && !CJKRangeName(linetext.slice(at-1,at))) { //往前直到 是字
                at--;
            }
            thechar=linetext.slice(at-1,at);
            line=i;
            break;
        }
    }
    return [line*(FolioChars+255)+ch, thechar ] ;
}
export const folioAtLine=(cm,line)=>{
    let foliolines=5,folio='';//default value
    //mark might come at the last if the folio line is change, 
    // so need to check all 

    const foliomarklines=[];
    for (let i=0;i<foliomarks.length;i++) {
        const mark=foliomarks[i].find();
        if (!mark || mark.from.line>line) continue;        
        foliomarklines.push([mark.from.line,i]);
    }
    foliomarklines.sort((a,b)=>b[0]-a[0]);//get closest;
    if (!foliomarklines.length) return {lines:0,folio:''};

    const closestmark=foliomarks[foliomarklines[0][1]].find();
    const {from,to}=closestmark;
        
    const linetext=cm.getLine(from.line);
    const offtag=linetext.slice(from.ch, to.ch);
    const m=offtag.match(/lines=(\d+)/);
    if (m) foliolines=parseInt(m[1])||5;
    else foliolines=5;
    const m2=offtag.match(/folio#([a-z\d\-_]+)/);
    if (m2) folio=m2[1];

    return {lines:foliolines,folio};
}
let changingtext=false;

export const beforeChange=(cm,obj)=>{
    const {origin,text,to,from,cancel}=obj;
    if (origin=='setValue'||!origin) return;
    if (changingtext) return;
    if (!canedit) cancel();
}
export const afterChange=(cm,obj)=>{
    const {removed,from,to,text} = obj;
    const marks=cm.findMarks(from,to);
    marks.forEach(mark=>mark.clear());
    for(let i=from.line;i<from.line+text.length;i++) {
        markOfftext(cm,i);
    }
    dirty.set( get(dirty)+1)
}
export const countPB=text=>{
    let count=0;
    text.replace(/\^lb/g,(m)=>count++);
    return count;
}
export const cursorActivity=(cm)=>{
    const [pb,pagetext] = getCursorPage(cm,true);
    const [pos,ch]=getMarkPos(pagetext);
    cursormark.set(pos)  
    cursorchar.set(ch)
    const line=cm.getCursor().line;
    cursorline.set( line);
    activepb.set(pb);
    const {lines,folio}=folioAtLine(cm,line);
    folioLines.set(lines);
    activefolioid.set(folio);
}
export const touchtext=(cb)=>{
    const cm=get(thecm);
    changingtext=true;
    cm.operation(cb);
    changingtext=false;
}
const replaceLine=(cm,line,newtext)=>{
    const oldtext=cm.getLine(line);
    cm.replaceRange( newtext, {line,ch:0},{line,ch:oldtext.length});
}
const nextLb=(cm,line,ch)=>{
    let nextline=line+1<cm.lineCount()?"\n"+cm.getLine(line+1):'';
    let nextline2=line+2<cm.lineCount()?"\n"+cm.getLine(line+2):'';
    let nextline3=line+3<cm.lineCount()?"\n"+cm.getLine(line+3):'';

    let linetext=cm.getLine(line)
    let ingatha=~linetext.indexOf('^gatha');
    //if next line is gatha but not this line, stop at the begining of next line
    if (!~linetext.indexOf('^gatha') && ~nextline.indexOf('^gatha')) {
        linetext= linetext.slice(ch)+"\n"
    } else {
        linetext= linetext.slice(ch)+nextline+nextline2+nextline3;
    }

    //text in bracket not counted
    linetext=linetext.replace(/[【（]([^】]+)[）】]/g,(m,m1)=>'【'+ '】'.repeat(m.length+1));


    let remain=FolioChars;
    let now=0;
    while (remain>0 && now<linetext.length) {
        let c=linetext.charAt(now);
        if (c=="\n" && now+1<linetext.length) {
            now++;
            c=linetext.charAt(now);
            if (ingatha &&!~linetext.slice(now).indexOf('^gatha')) { //偈頌結束
               break;
            }
        }
        
        if (linetext.slice(now).startsWith('^gatha')) ingatha=true;
        
        const r=CJKRangeName(c);
        if (r || c=='　') {
            remain--;
        } else if (ingatha && ~"。；！？，".indexOf(c)) {
            remain--;
        }
        
        now++;
    }
    while (now <linetext.length) {//skip all puncs and tag
        const c=linetext.charAt(now);
        const r=CJKRangeName(c);
        if (r || c=='「' || c=='『' || c=='^') {
            break;
        }
        now++
    }
    return now;
}
export const keyDown=(cm,e)=>{
    cm.toggleOverwrite(false);//make sure in insert mode
    if (e.key=='F2') {
        editfreely.set( get(editfreely)=='on'?'off':'on')
    }

    if (canedit) return;
    const cursor=cm.getCursor();
    const linetext=cm.getLine(cursor.line);
    const marks=cm.doc.findMarksAt(cursor);
    let m=null;
    if (marks.length) {
        m=marks[0].find();
    }

    const insidetag=!(marks.length==0 || m?.from.ch==cursor.ch || m?.to.ch==cursor.ch);
    if (e.key=='Enter') {
        if (!insidetag) {
            const linetext=cm.getLine(cursor.line);
            const [pb,lines,pbindex]=getCursorPage(cm);

            const lfs=countPB(getRangeText(cm,cm.posFromIndex(pbindex), cursor).join(''),cursor.line,cursor.ch);
            let toinsert='^lb';
            if (lfs+1>=get(folioLines)) {
                toinsert='^pb'+(pb+2);
            }
            touchtext(()=>{
                newtext=(linetext.slice(0,cursor.ch)+toinsert+linetext.slice(cursor.ch));
                replaceLine(cm,cursor.line,newtext);
                const next=nextLb(cm,cursor.line,cursor.ch);
                const idx=cm.indexFromPos(cursor)+next;
                cm.setCursor(cm.posFromIndex(idx));
            })    
        }
    }  else if (e.key=='Delete'||e.key=='Backspace') {//remove lb or pb
        if (marks.length) {
            const cursor=cm.getCursor();
            if (marks[0].className=='pb' || marks[0].className=='lb') {
                const {from,to}=marks[0].find();
                const newtext=linetext.slice(0,from.ch)+linetext.slice(to.ch);
                touchtext(()=>{
                    replaceLine(cm,cursor.line,newtext);
                    cm.setCursor({line:cursor.line,ch:from.ch});
                })
            }    
        } else {
            let newtext=linetext;
            let ch=cursor.ch;
            if (e.key=="Backspace" &&linetext.slice(cursor.ch-1,cursor.ch)=='　'){
                newtext=linetext.slice(0,cursor.ch-1)+linetext.slice(cursor.ch);
                ch--;
            }
            else if (e.key=="Delete" && linetext.slice(cursor.ch,cursor.ch+1)=='　'){
                newtext=linetext.slice(0,cursor.ch)+linetext.slice(cursor.ch+1);
            }
            if (newtext!==linetext) {
                touchtext(()=>{
                    replaceLine(cm,cursor.line,newtext);
                    cm.setCursor({line:cursor.line,ch});
                })
            }
        }
    } else if (!insidetag && e.key==' ') {
        const newtext=linetext.slice(0,cursor.ch)+'　'+linetext.slice(cursor.ch);
        touchtext(()=>{
            replaceLine(cm,cursor.line,newtext);
            cm.setCursor({line:cursor.line,ch:cursor.ch+1});
        })        
    }
}
export const getJuanLine=(juan)=>{
    const cm=get(thecm);
    const folios=cm.getAllMarks().filter(it=>it.className=='folio');
    for (let i=0;i<folios.length;i++) {
        const {from,to}=folios[i].find();
        const linetext=cm.getLine(from.line);
        const m=linetext.match(/\^folio#[a-z]+(\d*)/);
        if (m && parseInt(m[1])==juan) {
            return from.line;
        }
    }
    return 1;   
}
export const loadCMText=(text)=>{
    const cm=get(thecm);
    const line= cm.getCursor().line;
    cm.doc.setValue(text);
    const lines=text.split('\n');
    pbs.length=0;
    maxjuan.set(1);
    cm.operation(()=>{
        for (let i=0;i<lines.length;i++) markOfftext( cm, i);
    });
    if (line<=cm.lineCount()) cm.setCursor({line});
    maxline.set(cm.lineCount())
    cm.toggleOverwrite(false);//make sure in insert mode

    
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
        } else if (m1.startsWith('lb')){
            cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"lb"})
        } else if (m1.startsWith('folio')) {
            const foliomark=cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"folio"})
            foliomarks.push(foliomark);
            const juan=cm.getLine(line).slice(ch,ch+m.length).match(/\^folio#[a-z]+(\d*)/);
            if (juan && parseInt(juan[1])>get(maxjuan)) {
                maxjuan.set(parseInt(juan[1]));
            }
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

