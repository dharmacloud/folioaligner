import {writable} from 'svelte/store';


export const dirty=writable(false);
export const thecm=writable(null);
export const cursorline=writable(0);
export const maxpage=writable(0);
export const videoId=writable('')
export const videoSeekTo=writable(0)
export const localfile=writable();
export const juan=writable(1);
export const pb=writable(1);
