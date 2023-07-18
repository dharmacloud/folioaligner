import {bsearchNumber,OFFTAG_REGEX_G,splitUTF32Char,isPunc} from 'ptk';
import {dirty,thecm,cursorline,juan,pb,replacing,filename} from './store.js';
import {get} from 'svelte/store';
const juans=[],pbs=[];

export const countChar=(linetext)=>{ //see accelon/longcang/gen.js
    const chars=splitUTF32Char(linetext);
    let i=0,count=0;
    while (i<chars.length) {
        const cp=chars[i]?.charCodeAt(0);
        if (!isPunc(chars[i]) && (cp>=0x3400||cp==0x3246))  {
            count++;
        }
        i++;
    }
    return count;
}
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
    console.log(cm.lineCount())
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

const isGatha=linetext=>{
    return linetext.length>=5 && !~linetext.indexOf('。') && ~linetext.indexOf('　');
}

export const reflowLine=(cm,line)=>{
    const pagetext=[];
    let till=line;
    let firstline=cm.getLine(line);
    if (isGatha(firstline)) {
        firstline=firstline.replace(/　/g,'●')+'●';
    }
    pagetext.push(firstline);
    for (let i=line+1;i<cm.lineCount();i++) {
        let linetext=cm.getLine(i);
        if (~linetext.indexOf('^pb')) {
            break;
        } else {
            if (isGatha(linetext)) {
                linetext='●'+linetext.replace(/　/g,'●')+'●';
            }
            pagetext.push(linetext);
            till=i;
        }
        if (pagetext.length>20) break;
    }
    const text=pagetext.join('').replace(/●+/g,'●');
    const chars=splitUTF32Char(text), out=[];
    let count=0,linetext='';
    for (let i=0;i<chars.length;i++) {
        linetext+=chars[i];
        const cp=chars[i].codePointAt(0)||0;
        if (!isPunc(chars[i]) && (cp>=0x3400||cp==0x3246||cp==0x25cf)) { //leading fullwidth blank not counted
            if (linetext=='●') {
                //not counting leading ●
            } else count++;
        }
        if (count==17) {
            out.push(linetext.replace(/^●/g,'').replace(/●$/g,'').replace(/●/g,'　'))
            count=0;
            linetext='';
        }
    }
    if (linetext) out.push(linetext.replace(/^●/g,'').replace(/●$/g,'').replace(/●/g,'　'));
    const newtext=(out.join('\n')   
    
    .replace(/　\n/g,'\n')
    .replace(/\n。/g,'。\n').replace(/\n．/g,'．\n').replace(/\n+/g,'\n')).trim()+'\n';
    cm.replaceRange(newtext, {line,ch:0},{line:till+1,ch:0});
}
export const afterChange=(cm:CodeMirror,obj)=>{
    const {removed,from,to,text} = obj;
    get(filename)&&dirty.set(true);
    if ( ~text.join('').indexOf('^') || ~removed.join('').indexOf('^') ){
        const marks=cm.findMarks(from,to);
        marks.forEach(mark=>mark.clear());
        for(let i=from.line;i<from.line+text.length;i++) {
            markOfftext(cm,i);
        }
        rebuildJuanPb(cm);
    }
    const linetext= cm.getLine(from.line);
    if (countChar(linetext)>17) {
        touchtext(()=>{
            reflowLine(cm,from.line);
        })
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
            setTimeout(()=>{
                cm.setCursor({line:cursor.line+1,ch:0});
            },10)
        }
    } else if(key=='arrowup') {
        if (cursor.line>0) {
            let prevtext=cm.getLine(cursor.line-1);
            prevtext='^pb'+prevtext;
            cm.doc.replaceRange( prevtext+'\n'+linetext,{line:cursor.line-1,ch:0},{line:cursor.line,ch:linetext.length-3})
            setTimeout(()=>{
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
    replacing.set(sel);

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
export const touchtext=(cb)=>{
    const cm=get(thecm);
    cm.off("beforeChange",beforeChange);
    cm.operation(cb);
    cm.on("beforeChange",beforeChange);    
}
const replaceLine=(cm,line,newtext)=>{
    const oldtext=cm.getLine(line);
    cm.replaceRange( newtext, {line,ch:0},{line,ch:oldtext.length});
}
export const keyDown=(cm,e)=>{
    const marks=cm.doc.findMarksAt(cm.getCursor());
    cm.toggleOverwrite(false);
    if ((marks.length==0 || marks[0].className!=='pb')&& e.key=='Insert') { //move pb to cursor, add if no
        const cursor=cm.getCursor();
        const linetext=cm.getLine(cursor.line);
        touchtext(()=>{
            let newtext=linetext.replace('^pb','^^^');
            newtext=(newtext.slice(0,cursor.ch)+ (cursor.ch?'\n':'')+//split a line or insert at the begining
            '^pb'+newtext.slice(cursor.ch)).replace('^^^','')
            replaceLine(cm,cursor.line,newtext);
            cm.setCursor({line:cursor.line+1,ch:0})
        })
        return;
    } else if (marks.length &&e.key=='Delete') {//remove pb
        const cursor=cm.getCursor();
        const linetext=cm.getLine(cursor.line);
        if (marks[0].className=='pb') {
            let at=cursor.ch;
            while (linetext.charAt(at)!=='^' && at>0) at--;
            if (cursor.ch-at==3) return;//do not delete when cursor at the end of pb
            const newtext=linetext.slice(0,at)+linetext.slice(at+3);
            touchtext(()=>{
                replaceLine(cm,cursor.line,newtext);
                cm.setCursor({line:cursor.line,ch:at});
            })
        }
        return;
    }

    if (!e.ctrlKey ) return;
    if (e.key=="ArrowDown"||e.key=="ArrowUp"||e.key=="ArrowRight"||e.key=="ArrowLeft") {
        const m=cm.findMarksAt(cm.getCursor());
        if (m&&m.length &&m[0].className=='pb') {
            movePb(cm,e);
            e.preventDefault();
        }
    }
}

//insert a new pb
//delete a pb  (delete) 
