import {verifyPermission} from "ptk"
import {thecm,localfile,juan,pb,dirty,maxpage,maxjuan,maxline,filename,cursorline,savedpos} from "./store.js";
import {setCursorLine, loadCMText} from './editor.js'
import {get} from 'svelte/store'
import {findSutra} from './sutra.js'
import { updateSettings } from "./savestore.js";

export let sutra,texturl='',filehandle;

const pickerOpts = {
    types: [{description: "Offtext",accept: {"off/*": [".off"] }}],
    excludeAcceptAllOption: true,
    multiple: false,
  };

export let workingfile;

const loadText=(text,fn)=>{
    const line=get(savedpos)[fn] || 0;
    maxline.set(loadCMText(text));
    setCursorLine( line );
}
export const  openOff=async ()=>{
    const filehandles = await window.showOpenFilePicker(pickerOpts);
    filehandle=filehandles[0];
    const fn=filehandle.name
    filename.set(fn);

    // loadSutra(fn);
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
    const newsavedpos=Object.assign({} , get(savedpos));
    newsavedpos[filehandle.name]=get(thecm).getCursor().line;
    updateSettings({savedpos:newsavedpos});
}
export const loadSutra=async (id)=>{
    sutra=findSutra(id)
    if (!sutra)return;
    if (document.location.protocol=='file:') { //|| document.location.protocol=='http:'
        // videoId.set('mp4/ql'+sutra.no+'.mp4');
    } else {
        // videoId.set(sutra.youtube);
    }
    juan.set(1);
    pb.set(1);
    maxjuan.set(sutra.juanpage.length);
    maxpage.set(sutra.juanpage[get(juan)-1]);

    if (document.location.protocol=='https:') {
        texturl='https://raw.githubusercontent.com/accelon/longcang/main/off/ql'+sutra.no+'.off'
    } else if (document.location.protocol=='http:'){
        texturl='off/ql'+sutra.no+'.off';
    }
    if (texturl) {
        const resp=await fetch(texturl, {cache: "no-store"});
        content=await resp.text();
        loadCMText(content);    
    }
}