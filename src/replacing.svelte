<script>
import {markOfftext,touchtext} from './editor.js';
import {replacing,thecm} from './store.js';

const applychange=()=>{
    const cm=$thecm;
    const sel=cm.getSelection();
    const cursor=cm.getCursor();
    if (sel!==value) {
        touchtext(()=>{
            cm.replaceSelection(value);
            markOfftext(cm,cursor.line)
        });
        cm.setSelection(cm.getCursor());
        replacing.set('');
    }
}
$: value=$replacing;
</script>

<input bind:value /><button on:click={applychange}>✔</button>
<style>
input{font-size:100%}
</style>