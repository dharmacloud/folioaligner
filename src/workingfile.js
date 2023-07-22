import {verifyPermission} from "ptk"
import {thecm,localfile,dirty,maxline,filename,cursorline,savedpos} from "./store.js";
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
        dirty.set(0);
        localStorage.setItem('aligner_'+filehandle.name, get(cursorline) );
    }
    const newsavedpos=Object.assign({} , get(savedpos));
    newsavedpos[filehandle.name]=get(thecm).getCursor().line;
    updateSettings({savedpos:newsavedpos});
}