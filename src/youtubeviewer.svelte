<script>
import {videoId,videoSeekTo} from './store.js'

var player;
const helpVideoId='2TskfhLQ9Jk';
window.onYTReady=()=> {
    // 一般使用 影片的id寫在js裡
    player = new YT.Player('player', {
    height: '100%', // 高度預設值為390，css會調成responsive
    // width: '640', // 寬度預設值為640，css會調成responsive
    videoId: helpVideoId,
    playerVars: {  controls: 0 ,disablekb:1, rel:0},
    events: {
        'onReady': onPlayerReady
    }
    });
}
const loadVideo=(id)=>{
    if (!id) return;
    player.loadVideoById(id);
    setTimeout(()=>{
        player.pauseVideo();
    },2000);
}
const seekTo=t=>{
    player&&player.seekTo(t);
}
$: loadVideo($videoId)
$: seekTo($videoSeekTo)
function onPlayerReady(e) {
        // 為確保瀏覽器上可以自動播放，要把影片調成靜音
        e.target.mute().playVideo();
        setTimeout(async ()=>{
            e.target.pauseVideo();
        },1000);
}
</script>
<div style="height:100vh"><div id="player"></div></div>