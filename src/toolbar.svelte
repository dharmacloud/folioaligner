<script>
import {videoId,videoSeekTo} from './store.js';
import Inputnumber from './inputnumber.svelte';
import {sutras,findSutra} from './sutra.js'
let sutra,maxjuan=1,maxpage=1,juan=1,page=1;
const onJuanChange=v=>{
    maxjuan=sutra.juanpage.length;
    page=1;
    juan=v;
    maxpage=sutra.juanpage[v-1];
    onPageChange(page);
    return v;
}
const onPageChange=v=>{
    let juanstart=0;
    for (let i=0;i<juan-1;i++) {
        juanstart+=sutra.juanpage[i]-1;
    }
    const seek= juanstart+v-1;
    videoSeekTo.set(seek);
    return v;
}
const onSutra=e=>{
    const option=e.target.selectedOptions[0];
    sutra=findSutra(option.id)
    if (!sutra)return;
    videoId.set(sutra.youtube);
    juan=1;
    page=1;
    maxjuan=sutra.juanpage.length;
    maxpage=sutra.juanpage[juan-1];
}
</script>

<span class="Toolbar">
<select on:change={onSutra}>
    <option>選經</option>
    {#each sutras as sutra}
    <option id={sutra.no}>{sutra.title}</option>
    {/each}
</select>
卷<Inputnumber max={maxjuan} value={juan} onChange={onJuanChange}/>
頁<Inputnumber max={maxpage} value={page} onChange={onPageChange}/>
</span>

<style>
.Toolbar {height: 1.5em}

</style>
