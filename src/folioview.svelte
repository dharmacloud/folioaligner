<script>
import {ZipStore} from 'ptk/zip';
import {activefolioid,foliopath} from './store.js'
import Swipe from './3rdparty/swipe.svelte';
import SwipeItem from './3rdparty/swipeitem.svelte';

let defaultIndex=0;
let swiper;
let images=[];
const swipeConfig = {
    autoplay: false,
    delay: 0,
    showIndicators: false,
    transitionDuration: 250
};

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
const loadZip=async src=>{
    ready=false;
    const res=await fetch(src);
    const buf=await res.arrayBuffer();
    const zip=new ZipStore(buf);
    const imgs=[];
    for (let i=0;i<zip.files.length;i++) {
        const blob=new Blob([zip.files[i].content]);
        imgs.push(URL.createObjectURL(blob));
    }    
    defaultIndex=zip.files.length-1;
    images=imgs;
    setTimeout(()=>{
        ready=true;
    },100)
    
}

$: loadZip($foliopath+$activefolioid+".zip");
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
{:else}
Loading Image
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