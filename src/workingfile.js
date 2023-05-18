import {verifyPermission} from "ptk"
import {thecm,localfile,videoId,juan,pb,dirty,maxpage,maxjuan,maxline,filename,cursorline} from "./store.js";
import {setCursorLine, loadCMText} from './editor.ts'
import {get} from 'svelte/store'
import {findSutra} from './sutra.js'

export let sutra,texturl='',filehandle;

const pickerOpts = {
    types: [{description: "Offtext",accept: {"off/*": [".off"] }}],
    excludeAcceptAllOption: true,
    multiple: false,
  };

export let workingfile;

const loadText=(text,fn)=>{
    maxline.set(loadCMText(text));
    setCursorLine( parseInt(localStorage.getItem('aligner_'+fn))||1);
}
export const  openOff=async ()=>{
    const filehandles = await window.showOpenFilePicker(pickerOpts);
    filehandle=filehandles[0];
    const fn=filehandle.name
    filename.set(fn);
    const m=fn.match(/ql([\da-z]+)/);
    if (!m) return;

    loadSutra(m[1]);
    workingfile=await filehandle.getFile();

    const text=await workingfile.text();
    localfile.set(true);
    loadText(text,fn);
}

 export const save=async()=>{
    if (!filehandle) return;//test
    if (await verifyPermission( filehandle,true)) {
        const writable = await filehandle.createWritable();
        await writable.write(get(thecm).getValue());
        await writable.close()
        dirty.set(false);
        localStorage.setItem('aligner_'+filehandle.name, get(cursorline) );
    }
}
export const loadSutra=async (id)=>{
    sutra=findSutra(id)
    if (!sutra)return;
    if (document.location.protocol=='file:'|| document.location.protocol=='http:') {
        videoId.set('mp4/ql'+sutra.no+'.mp4');
    } else {
        videoId.set(sutra.youtube);
    }
    juan.set(1);
    pb.set(1);
    maxjuan.set(sutra.juanpage.length);
    maxpage.set(sutra.juanpage[get(juan)-1]);

    if (document.location.protocol=='https') {
        texturl='https://raw.githubusercontent.com/accelon/longcang/off/main/ql'+sutra.no+'.off'
    } else {
        texturl='off/ql'+sutra.no+'.off';
    }
    const resp=await fetch(texturl, {cache: "no-store"});
    content=await resp.text();
    loadCMText(content);
}