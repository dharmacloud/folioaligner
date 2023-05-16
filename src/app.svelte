<script>
import {onMount} from 'svelte'
import {get} from 'svelte/store'
import Toolbar from './toolbar.svelte'
import EditorToolbar from './editortoolbar.svelte'
import SplitPane from './3rdparty/splitpane.svelte';
import {thecm} from './store.js';
import {keyDown,afterChange,beforeChange, cursorActivity,loadCMText} from './editor.ts'
import VideoViewer from './videoviewer.svelte'
let editor;

let pos=50;
onMount(()=>{
    const cm=new CodeMirror(editor, {
	    value:'',lineWrapping:false,
        theme:'ambiance',styleActiveLine:true
    })
    thecm.set(cm);
    get(thecm).on("cursorActivity",cursorActivity);
    get(thecm).on("beforeChange",beforeChange);
    get(thecm).on("change",afterChange)
    get(thecm).on("keydown",keyDown)
    loadCMText("工作區");
})

</script>

<div class="app">

<SplitPane type="horizontal" bind:pos min={15} max={85}>
    <div slot="a">
        <div><VideoViewer/></div>
    </div>
    <div slot="b">
        <Toolbar/>
        <EditorToolbar/>
        <div bind:this={editor}></div>
    </div>
</SplitPane>
</div>

<style>
.app {height:100vh} /* splitpane divider need this */
</style>