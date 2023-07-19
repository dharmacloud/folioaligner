<script>
import Toolbar from './toolbar.svelte'
import SplitPane from './3rdparty/splitpane.svelte';
import {thecm,replacing,activefolioid,panepos} from './store.js';
import {keyDown,afterChange,beforeChange, cursorActivity,loadCMText} from './editor.js'
import FolioView from './folioview.svelte'
import Replacing from './replacing.svelte'
import Help from './help.svelte'
import { get } from 'svelte/store';

import { onMount } from 'svelte/internal';
let editor;


const createEditor=()=>{
    if ( get(thecm)) return;
    const cm=new CodeMirror(editor, {
	    value:'',lineWrapping:true,
        theme:'ambiance',styleActiveLine:true
    })
    thecm.set(cm);
    cm.on("cursorActivity",cursorActivity);
    cm.on("beforeChange",beforeChange);
    cm.on("change",afterChange)
    cm.on("keydown",keyDown)
    loadCMText("");
}
onMount(()=>{
    createEditor()
})

</script>

<div class="app">

<SplitPane type="horizontal" bind:pos={$panepos} min={15} max={85}>
    <div slot="a">
        <div><FolioView/></div>
    </div>
    <div slot="b">
        {#if $replacing && !~$replacing.indexOf('\n')}
        <Replacing/>
        {:else}
        <Toolbar/>
        {/if}
        {#if !$activefolioid}<Help/>{/if}
        <div bind:this={editor}></div>
    </div>
</SplitPane>
</div>

<style>
.app {height:100vh} /* splitpane divider need this */
</style>