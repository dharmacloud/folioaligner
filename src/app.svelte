<script>
import {onMount} from 'svelte'
import Toolbar from './toolbar.svelte'
import SplitPane from './3rdparty/splitpane.svelte';
import {thecm,replacing} from './store.js';
import {keyDown,afterChange,beforeChange, cursorActivity,loadCMText} from './editor.ts'
import VideoViewer from './videoviewer.svelte'
import Replacing from './replacing.svelte'
let editor;

let pos=50;
onMount(()=>{
    const cm=new CodeMirror(editor, {
	    value:'',lineWrapping:false,
        theme:'ambiance',styleActiveLine:true
    })
    thecm.set(cm);
    cm.on("cursorActivity",cursorActivity);
    cm.on("beforeChange",beforeChange);
    cm.on("change",afterChange)
    cm.on("keydown",keyDown)
    loadCMText("工作區");
})

</script>

<div class="app">

<SplitPane type="horizontal" bind:pos min={15} max={85}>
    <div slot="a">
        <div><VideoViewer/></div>
    </div>
    <div slot="b">
        {#if $replacing && !~$replacing.indexOf('\n')}
        <Replacing/>
        {:else}
        <Toolbar/>
        {/if}
        <div bind:this={editor}></div>
    </div>
</SplitPane>
</div>

<style>
.app {height:100vh} /* splitpane divider need this */
</style>