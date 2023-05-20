<script>
import {videoId,videoSeekTo,player} from './store.js'

window.onYTReady=()=>{
 setTimeout(()=>{
    const helpVideoId='9U9ddWjH2AQ';
    const pylr=new YT.Player('player', {
    height: '100%', // 高度預設值為390，css會調成responsive
    // width: '640', // 寬度預設值為640，css會調成responsive
    videoId: helpVideoId,
    playerVars: {  controls: 0 ,disablekb:1, rel:0},
    events: {
        'onReady': onPlayerReady
    }
    });
    player.set(pylr)
 },3000)

}
function onPlayerReady(e) {
    // 為確保瀏覽器上可以自動播放，要把影片調成靜音
    console.log('player ready')
    e.target.mute().playVideo();
    setTimeout(async ()=>{
        e.target.pauseVideo();
    },1000);
}
const loadVideo=(id)=>{
    if (!id) return;
    $player?.loadVideoById(id);
    setTimeout(()=>{
        $player?.pauseVideo();
    },2000);
}
const seekTo=t=>{
    $player?.seekTo(t);
}
$: if ($videoId&& document.location.protocol!=='file:') loadVideo($videoId)
$: seekTo($videoSeekTo)

</script>
<div style="height:100vh"><div id="player"></div></div>