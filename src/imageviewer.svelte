<script>
import Help from './help.svelte';
import {imageurl} from './store.js'
</script>
{#if $imageurl}
<img id='image1' src={$imageurl} class="image" alt="noimage"/>
{:else}
<Help/>
{/if}

<style>
.image {height:95vh}
</style>