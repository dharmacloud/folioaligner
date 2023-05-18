<script>
import { videoId,videoSeekTo,player } from './store';

import Youtubeviewer from './youtubeviewer.svelte';
let mp4player
const seekTo=t=>{
    if(mp4player)mp4player.currentTime=t+0.2;
}
//||document.location.protocol=='http:'
$: seekTo($videoSeekTo);
</script>

{#if document.location.protocol=='file:'} 
<!-- svelte-ignore a11y-media-has-caption -->
{#key $videoId}
{#if !$videoId}必須有本地影片{/if}
<video bind:this={mp4player}>
    <source src={$videoId} type="video/mp4"/>
</video>
{/key}
{:else}
<Youtubeviewer/>
{/if}
<style>
    video {height:100vh}
</style>
