<script>
let canvas;
function sleep(time) {  return(new Promise(r=>{ setTimeout(()=>r() , time)}))};
var player;
window.onYTReady=()=> {
    // 一般使用 影片的id寫在js裡
    player = new YT.Player('player', {
    height: '100%', // 高度預設值為390，css會調成responsive
    // width: '640', // 寬度預設值為640，css會調成responsive
    videoId: '9U9ddWjH2AQ',
    disablekb:true,
    rel:0,
    events: {
        'onReady': onPlayerReady
    }
    });
}
function onPlayerReady(e) {
        // 為確保瀏覽器上可以自動播放，要把影片調成靜音
        e.target.mute().playVideo();
        setTimeout(async ()=>{
            e.target.pauseVideo();

            await sleep(5000)
            e.target.seekTo(200)
        },1500)      
}
</script>
<div style="height:95vh"><div id="player"></div></div>