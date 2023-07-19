<script>
import {localfile,cursorline,dirty,juan,pb, thecm,maxpage,maxjuan,maxline,filename,editfreely} from './store.js';
import InputNumber from './inputnumber.svelte';
import {sutras} from './sutra.js'
import {setCursorLine} from './editor.js'
import {sutra,openOff,save,loadSutra} from './workingfile.js'
import Switch from './3rdparty/switch.svelte'
const onJuanChange=v=>{
    maxjuan.set(sutra.juanpage.length);
    $pb=1;
    $juan=v;
    maxpage.set(sutra.juanpage[v-1]);
    onPageChange($pb);
    return v;
}
const onPageChange=v=>{
    // const line=lineOfJuanPb($juan,v);
    // if (line<=$thecm.lineCount()) $thecm.setCursor({line});
    // pb.set(v)
    return v;
}
const seekVideo=(j,p)=>{
}

$: seekVideo($juan,$pb);


const onSutra=async e=>{
    const option=e.target.selectedOptions[0];
    await loadSutra(option.id);
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

</script>

<svelte:window on:keydown={handleKeydown}/>
<span class="Toolbar">
<button disabled={$dirty&&$filename} title="alt-p" class="clickable" on:click={openOff}>📂</button>
{#if $filename}
<button disabled={!$dirty||!$filename} title="alt-s" on:click={save}>💾</button>
卷<InputNumber max={$maxjuan} value={$juan} onChange={onJuanChange}/>
頁<InputNumber max={$maxpage} value={$pb} onChange={onPageChange}/>
{/if}
<InputNumber bind:value={$cursorline} onChange={setCursorLine} min={1} max={$maxline}/>
<Switch bind:value={$editfreely} label="自由編輯" design="slider" fontSize="24"></Switch>
</span>

<style>
.Toolbar {height: 1.5em;display:flex}

</style>
