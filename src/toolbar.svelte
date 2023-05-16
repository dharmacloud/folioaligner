<script>
import {videoId,videoSeekTo,localfile,juan,pb, thecm} from './store.js';
import Inputnumber from './inputnumber.svelte';
import {sutras,findSutra} from './sutra.js'
import {lineOfJuanPb, loadCMText} from './editor.ts'
let sutra,maxjuan=1,maxpage=1,texturl='';


const onJuanChange=v=>{
    maxjuan=sutra.juanpage.length;
    $pb=1;
    $juan=v;
    maxpage=sutra.juanpage[v-1];
    onPageChange($pb);
    return v;
}
const onPageChange=v=>{
    const line=lineOfJuanPb($juan,v);
    $thecm.setCursor({line});
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
    sutra=findSutra(option.id)
    if (!sutra)return;
    videoId.set(sutra.youtube);
    $juan=1;
    $pb=1;
    maxjuan=sutra.juanpage.length;
    maxpage=sutra.juanpage[$juan-1];

    if (document.location.protocol=='https') {
        texturl='https://raw.githubusercontent.com/accelon/longcang/off/main/ql'+sutra.no+'.off'
    } else {
        texturl='off/ql'+sutra.no+'.off';
    }
    const resp=await fetch(texturl, {cache: "no-store"});
    content=await resp.text();
    loadCMText(content);
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
卷<Inputnumber max={maxjuan} value={$juan} onChange={onJuanChange}/>
頁<Inputnumber max={maxpage} value={$pb} onChange={onPageChange}/>
</span>

<style>
.Toolbar {height: 1.5em}

</style>
