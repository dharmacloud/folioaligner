import {verifyPermission} from "ptk"
import {thecm,localfile,videoId,juan,pb} from "./store.js";
import {setCursorLine, loadCMText} from './editor.ts'
import {get} from 'svelte/store'
import {findSutra} from './sutra.js'

export let sutra,maxjuan=1,maxpage=1,texturl='',filehandle, maxLine=0;

const pickerOpts = {
    types: [{description: "Offtext",accept: {"off/*": [".off"] }}],
    excludeAcceptAllOption: true,
    multiple: false,
  };

export let workingfile;

const loadText=(text,filename)=>{
    maxLine=loadCMText(text);
    setCursorLine( parseInt(localStorage.getItem('aligner_'+filename))||1);
}
export const  openOff=async ()=>{
    const filehandles = await window.showOpenFilePicker(pickerOpts);
    filehandle=filehandles[0];
    const filename=filehandle.name;
    const m=filename.match(/ql([\da-z]+)/);
    if (!m) return;

    loadSutra(m[1]);
    workingfile=await filehandle.getFile();

    const text=await workingfile.text();
    localfile.set(true);
    loadText(text,filename);
}

 export const save=async()=>{
    if (!filehandle) return;//test
    if (await verifyPermission( filehandle,true)) {
        const writable = await filehandle.createWritable();
        await writable.write(get(thecm).getValue());
        await writable.close()
        dirty.set(false);
        localStorage.setItem('aligner_'+filehandle.name, $cursorline );
    }
}
export const setmaxpage=v=>{
    maxpage=v;
}
export const setmaxjuan=v=>{
    maxjuan=v;
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
    maxjuan=sutra.juanpage.length;
    maxpage=sutra.juanpage[get(juan)-1];

    if (document.location.protocol=='https') {
        texturl='https://raw.githubusercontent.com/accelon/longcang/off/main/ql'+sutra.no+'.off'
        const resp=await fetch(texturl, {cache: "no-store"});
        content=await resp.text();
        loadCMText(content);        
    } else {
        texturl='off/ql'+sutra.no+'.off';
    }

}