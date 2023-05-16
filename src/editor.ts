import {bsearchNumber,OFFTAG_REGEX_G} from 'ptk';
import {dirty,segments,thecm,cursorline} from './store.js';
import {get} from 'svelte/store';

export const markOfftext=(cm,line,segs=null,lines=null)=>{
    const text=(lines&&lines[line])||cm.getLine(line);
    text.replace(OFFTAG_REGEX_G,(m,m1,m2,ch)=>{              
        const c=m1.charCodeAt(1);
        if (m1.startsWith('n') && c>0x30&&c<0x40 ) {
            if (segs && (!segs.length|| segs[segs.length-1]!==line) ) segs.push(line);
        }
        cm.doc.markText({line,ch},{line,ch:ch+m.length},{className:"offtag"})
    });
    return segs;
}
export const loadCMText=(text)=>{
    const cm=get(thecm);
    const line=cm.getCursor().line;
    cm.doc.setValue(text);
    const lines=text.split('\n');
    const segs=[];
    cm.operation(()=>{
        for (let i=0;i<lines.length;i++) {
            markOfftext(cm,i,segs,lines);
        }
    })
    if (segs[0] !==0 ) segs.unshift(0); //upper boundary
    segs.push(lines.length); //lower boundary
    segments.set(segs);
    cm.setCursor({line});
    return lines.length;

}
export const segmentOfLine=line=>{ // get the segment of line, begin with n
    const segs=get(segments);
    const at=bsearchNumber(segs,line+1)-1;
    return at;
}
export const cursorActivity=(cm:CodeMirror)=>{
    const cursor=cm.getCursor();
    cursorline.set(cursor.line+1)
    if (~cm.getLine(cursor.line).indexOf('^n'));
}
export const replaceSeg=(cm,nseg,lines)=>{
    const segs=get(segments);
    cm.operation(()=>{
        const markers=cm.doc.findMarks({line:segs[nseg],ch:0},{line:segs[nseg+1],ch:0});
        markers.forEach(mrk=>mrk.clear());
        for (let i=segs[nseg];i<segs[nseg+1];i++) {
            const linetext=cm.getLine(i);
            cm.doc.replaceRange(  lines[ i-segs[nseg]], {line:i,ch:0}, {line:i, ch:linetext?.length}  );
            linetext&&markOfftext(cm,i);
        }
    })
}
export const getSegmentText=(cm,segs,nseg)=>{
    const out=[]
    for (let i=segs[nseg]; i<segs[nseg+1];i++) {
        out.push(cm.getLine(i));
    }
    return out;
}

export const joinline=(cm,line)=>{
    const segs=get(segments);
    const nseg=segmentOfLine(line);
    if (segs[nseg]==line) return ; //cannot join first line
    const cursor=cm.getCursor();
    let lines=getSegmentText(cm,segs,nseg);
    const linecount=lines.length;
    let s='';
    for (let i=0;i<lines.length;i++) {
        s+=lines[i];
        if (line-1 !== segs[nseg]+i ) {
            s+='\n'
        }        
    }
    lines=s.split('\n');
    while (lines.length<linecount) lines.push('');
    replaceSeg(cm,nseg,lines);
    cm.setCursor(cursor);
}

export const breakline=(cm,line,ch)=>{
    const segs=get(segments);
    const nseg=segmentOfLine(line);
    const out=getSegmentText(cm,segs,nseg);
    const start=segs[nseg], end=segs[nseg+1], linecount=end-start;

    let insertpos=0;
    for (let i=start;i<line;i++) {
        insertpos+= out[i-start].length;
    }
    insertpos+=ch;
    out[line-start]= out[line-start].slice(0,ch)+'\n'+out[line-start].slice(ch);
    let s=out.join('\n').replace(/\n+$/,'');
    let lines=s.split('\n');
    if (lines.length>linecount) { //try to replace a empty line
        const at=s.indexOf( "\n\n", insertpos);
        if (~at) {
            s=s.slice(0,at)+s.slice(at+1);//remove one \n
            lines=s.split('\n');
        } else { //
            ///cannot replace
            return;
        }
    }
    while (lines.length<linecount) lines.push('');
    replaceSeg(cm,nseg,lines);
    cm.setCursor(line+1,0);
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

    if (origin=='+delete') { //join
        if (to.line==from.line+1 && to.ch==0) {
            joinline(cm,to.line);
            dirty.set(true);
        }
        cancel();
    } else if (origin=='+input') {
        if (text.length==1 && text[0]==' ') {
            syncScroll(get(cm1),get(cm2));
        }
        if (text.length==2 && text.join('')=='') {
            breakline(cm,from.line,from.ch);
            dirty.set(true);            
        }
        cancel();
    }   
}

export const setCursorLine=(line)=>{
    //get(cm2).setCursor({line:line-1});
    return line;
}