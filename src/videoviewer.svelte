<script>
import { videoId,videoSeekTo } from './store';
import YoutubeViewer from './youtubeviewer.svelte'
let player
const seekTo=t=>{
    if(player)player.currentTime=t+0.2;
}
$: seekTo($videoSeekTo);
</script>
{#key $videoId}
{#if document.location.protocol=='file:'||document.location.protocol=='http:'} 
{#if $videoId}
<!-- svelte-ignore a11y-media-has-caption -->
<video bind:this={player}>
    <source src={$videoId} type="video/mp4"/>
</video>
{/if}
{:else}
<YoutubeViewer/>
{/if}
{/key}
<style>
    video {height:100vh}
</style>
