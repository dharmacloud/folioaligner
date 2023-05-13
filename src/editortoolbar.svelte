<script>
import {verifyPermission} from "ptk"
import InputNumber from "./inputnumber.svelte";
import {cursorline,dirty,thecm} from "./store.js";
import {loadCMText ,setCursorLine } from "./editor.js";

const pickerOpts = {
  types: [{description: "Offtext",accept: {"off/*": [".off"] }}],
  excludeAcceptAllOption: true,
  multiple: false,
};
let workingfile,filehandle=null, max=0;

const loadText=(text,filename)=>{
    max=loadCMText(text);
    //references.set( referencesOf(filename));
    //loadReference(0);
    setCursorLine( parseInt(localStorage.getItem('aligner_'+filename))||1);
}

async function openOff(){
    const filehandles = await window.showOpenFilePicker(pickerOpts);
    filehandle=filehandles[0];
    workingfile=await filehandle.getFile();
    const text=await workingfile.text();
    loadText(text,filehandle.name);
}

async function save(){
    if (!filehandle) return;//test
    if (await verifyPermission( filehandle,true)) {
        const writable = await filehandle.createWritable();
        await writable.write($thecm.getValue());
        await writable.close()
        dirty.set(false);
        localStorage.setItem('aligner_'+filehandle.name, $cursorline );
    }
}
function handleKeydown(evt) {
    const key=evt.key.toLowerCase();
    const alt=evt.altKey;
    if (key=='f5') {//prevent refresh accidently
       // evt.preventDefault();
        return;
    } else if (key=='o' && alt) {
        openOff();
    } else if (key=='s' && alt) {
        save();
    }
}
const tryit=async ()=>{
    const response=await fetch("dn3.yh.off");
    loadText(await response.text(),"dn3.yh.off");
}

</script>
<svelte:window on:keydown={handleKeydown}/>
<button disabled={$dirty&&filehandle} title="alt-p" class="clickable" on:click={openOff}>📂</button>
<button disabled={!$dirty||!filehandle} title="alt-s" on:click={save}>💾</button>
<InputNumber bind:value={$cursorline} onChange={setCursorLine} min={1} {max}/>
{filehandle?.name||''}