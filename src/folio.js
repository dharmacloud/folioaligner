import {thepdf,maxpage, imageurl} from './store.js';
import {get} from 'svelte/store'
export const loadpdf=async (fn)=>{
    const reponse = await fetch(fn);
    const arraybuffer =await reponse.arrayBuffer();
    // const fileReader = new FileReader();  
    // const arraybuffer=await fileReader.readAsArrayBuffer(file);
    const typedarray = new Uint8Array(arraybuffer);
    const _pdf = await pdfjsLib.getDocument(typedarray).promise;
    thepdf.set(_pdf);
    maxpage.set(_pdf.numPages);
    imageurl.set( await getPageUrl(2));
}
export const getPageUrl=async (pn)=>{
    const promises=[];
    let canvas;
    const page=await get(thepdf).getPage(pn);
    const viewport = page.getViewport({ scale:1});
    canvas = document.createElement("canvas")
    canvas.height = viewport.height;
    canvas.width = viewport.width; 
    await page.render({canvasContext: canvas.getContext('2d'),viewport}).promise; 
    return canvas.toDataURL("image/png");
}


