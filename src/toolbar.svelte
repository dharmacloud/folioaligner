<script>
import {videoSeekTo,localfile,cursorline,dirty,juan,pb, thecm,maxpage,maxjuan,maxline,filename} from './store.js';
import InputNumber from './inputnumber.svelte';
import {sutras} from './sutra.js'
import {lineOfJuanPb,setCursorLine} from './editor.ts'
import {sutra,openOff,save,loadSutra} from './workingfile.js'

const onJuanChange=v=>{
    maxjuan.set(sutra.juanpage.length);
    $pb=1;
    $juan=v;
    maxpage.set(sutra.juanpage[v-1]);
    onPageChange($pb);
    return v;
}
const onPageChange=v=>{
    const line=lineOfJuanPb($juan,v);
    if (line<=$thecm.lineCount()) $thecm.setCursor({line});
    pb.set(v)
    return v;
}
const seekVideo=(j,p)=>{
    let juanstart=0;
    for (let i=0;i<j-1;i++) {
        juanstart+=sutra.juanpage[i]-1;
    }
    const seek= (juanstart + (p-1))>>1;// 一秒兩pb
    videoSeekTo.set(seek);
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

<span class="Toolbar">
{#if !$localfile}
<select on:change={onSutra}>
    <option>選經</option>
    {#each sutras as sutra}
    <option id={sutra.no}>{sutra.title}</option>
    {/each}
</select>
{/if}
卷<InputNumber max={$maxjuan} value={$juan} onChange={onJuanChange}/>
頁<InputNumber max={$maxpage} value={$pb} onChange={onPageChange}/>
</span>

<svelte:window on:keydown={handleKeydown}/>

<button disabled={$dirty&&filename} title="alt-p" class="clickable" on:click={openOff}>📂</button>
<button disabled={!$dirty||!filename} title="alt-s" on:click={save}>💾</button>
<InputNumber bind:value={$cursorline} onChange={setCursorLine} min={1} max={$maxline}/>
{$filename}

<style>
.Toolbar {height: 1.5em}

</style>
