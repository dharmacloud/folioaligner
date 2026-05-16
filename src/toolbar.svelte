<script>
import {activefolioid,cursorline,dirty,thecm,folioLines,maxjuan,maxline,filename,editfreely} from './store.js';
import InputNumber from './inputnumber.svelte';
import {setCursorLine,getJuanLine} from './editor.js'
import {openOff,save} from './workingfile.js'
import Switch from './3rdparty/switch.svelte'

let juan;
const onJuanChange=v=>{
    const line=1+(getJuanLine(v)||0);
    $thecm.setCursor({line,ch:0});
    return v;
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
const setjuan=(folioid)=>{
    const m=folioid.match(/(\d+)$/);
    if (m) {
        return parseInt(m[1]);
    }
    return 1;
}
$: juan=setjuan($activefolioid)
</script>

<svelte:window on:keydown={handleKeydown}/>
<span class="Toolbar">
<button disabled={$dirty&&$filename} title="alt-o" class="clickable" on:click={openOff}>📂</button>
{#if $filename}
<button disabled={!$dirty||!$filename} title="alt-s" on:click={save}>💾</button>
卷<InputNumber bind:max={$maxjuan} bind:value={juan} onChange={onJuanChange} min={1}/>
{#if $dirty>50}<span style="color:red">更動多處請存檔</span>{/if}

{/if}

<InputNumber bind:value={$cursorline} onChange={setCursorLine} min={1} max={$maxline}/>
{#key $editfreely}
<Switch bind:value={$editfreely} label="自由編輯F2" design="slider" fontSize="24"></Switch>
{/key} 每頁{$folioLines}行
</span>

<style>
.Toolbar {height: 1.5em;display:flex}

</style>
