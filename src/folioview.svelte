<script>
import {ZipStore} from 'ptk/zip';
import {activefolioid,foliopath,cursormark,cursorchar,folioLines,activepb,maxpage} from './store.js'
import Swipe from './3rdparty/swipe.svelte';
import SwipeItem from './3rdparty/swipeitem.svelte';
import {FolioChars} from './editor.js'
let defaultIndex=0;
let swiper;
let images=[];
let message='';
const swipeConfig = {
    autoplay: false,
    delay: 0,
    showIndicators: false,
    transitionDuration: 250
};
const imageFrame=()=>{
    const img=document.getElementsByClassName('swipe')[defaultIndex];
	if (!img || !img.clientHeight) return [0,0,0,0];
    
	const r=img.clientHeight / img.naturalHeight;
    const rect=img.getBoundingClientRect();
    if (rect.left<0) {//還沒捲好
        rect.left=stableleft;
    } else {
        stableleft=rect.left; //穩定的
    }
	const w=img.naturalWidth * r;
	const left=Math.floor((img.clientWidth- w)/2) + rect.x;
	return {left,top:rect.y,width:w,height:img.clientHeight} ;
}
const mousewheel=(e)=>{
    if (e.deltaY>0) {
        swiper.prevItem();
    } else {
        swiper.nextItem();
    }
    e.preventDefault();
}
const swipeChanged=(obj)=>{
    const {active_item}=obj.detail;
    defaultIndex=active_item;
}
let ready=false;
const loadZip=async folio=>{
    if (!folio)return;
    const src=$foliopath+folio+".zip";
    ready=false;
    message='loading '+src;
    let res=null,buf=null,zip=null;
    try {
        res=await fetch(src);
        buf=await res.arrayBuffer();
        zip=new ZipStore(buf);
    } catch (e) {
        message='cannot load '+src
        return;
    }

    const imgs=[];
    for (let i=0;i<zip.files.length;i++) {
        const blob=new Blob([zip.files[i].content]);
        imgs.push(URL.createObjectURL(blob));
    }    
    defaultIndex=zip.files.length-1;
    images=imgs;
    maxpage.set(zip.files.length)

    setTimeout(()=>{
        ready=true;
    },100)
    
}
const folioCursorStyle=mark=>{
    const line=Math.floor(mark / (FolioChars+255));
    const ch=mark % (FolioChars+255);
    const frame=imageFrame()
    const unitw=(frame.width/$folioLines)||0;
    const unith=(frame.height/FolioChars)||0;
    const left=Math.floor(($folioLines-line-1)*unitw);
    const top=Math.floor(unith*ch)-6;
    const style=`left:${left}px;top:${top}px;width:${unitw}px;height:12px`;
    return style;
}
const folioCursorCharStyle=mark=>{
    const line=Math.floor(mark / (FolioChars+255));
    const ch=mark % (FolioChars+255);
    const frame=imageFrame()
    const unitw=(frame.width/$folioLines)||0;
    const unith=(frame.height/FolioChars)||0;
    const left=Math.floor(($folioLines-line-1)*unitw);
    const top=Math.floor(unith*ch)-unith;
    const style=`left:${left}px;top:${top}px`;
    return style;
}
const gotoPb=(pb)=>{
    if (!$maxpage || !swiper)return;//not loaded yet
    const go=$maxpage-pb-1;
    if (go!==defaultIndex) {
        // console.log('goto',pb, go, defaultIndex)
        swiper.goTo(go);
    }
}

$: loadZip($activefolioid);
$: gotoPb($activepb)
    //{previewimages[previewimages.length-idx-1]
</script>
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="swipe-holder" on:wheel={mousewheel} >
{#if ready}
<Swipe bind:this={swiper} {...swipeConfig} {defaultIndex} on:click={onclick} on:change={swipeChanged}>
    {#each images as image,idx}
    <SwipeItem><img class="swipe" alt="no" src={images[images.length-idx-1]}/></SwipeItem>
    {/each}    
</Swipe>
<div class="foliocursor" style={folioCursorStyle($cursormark)}></div>
<div class="foliochar" style={folioCursorCharStyle($cursormark)}>{$cursorchar}</div>
{:else}
{message}
{/if}
</div>
<style>
.swipe-holder{
    z-index:999;
    height: 100vh;
    /* width: 50%;  */
}

.swipe {height:100vh;top:50%;left:50%;transform: translate(-0%,-0%); }
</style>