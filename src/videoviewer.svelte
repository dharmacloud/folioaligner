<script>
import { videoId,videoSeekTo } from './store';
import YoutubeViewer from './youtubeviewer.svelte'
let player
const seekTo=t=>{
    if(player)player.currentTime=t+0.2;
}
$: seekTo($videoSeekTo);
</script>
{#if document.location.protocol=='file:'||document.location.protocol=='http:'} 
<!-- svelte-ignore a11y-media-has-caption -->
{#key $videoId}
{#if $videoId}
<video bind:this={player}>
    <source src={$videoId} type="video/mp4"/>
</video>
{:else}
<YoutubeViewer/>
{/if}
{/key}
{/if}

<style>
    video {height:100vh}
</style>
