<script>
import {imageurl,maxpage} from './store.js';
import Inputnumber from './inputnumber.svelte';
import {getPageUrl, loadpdf} from './folio.js';
const pdffn='/pdf/0001-001.pdf'
let numPages=0 ,value=1;

const onChange=v=>{
    getPageUrl(v).then(url=>{
        imageurl.set(url);
    });
    return v;
}
</script>

<span class="Toolbar">
<button on:click={()=>loadpdf(pdffn)} >load</button>{$maxpage}
<Inputnumber max={$maxpage} bind:value {onChange}/>
</span>

<style>
.Toolbar {height: 1.5em}

</style>
