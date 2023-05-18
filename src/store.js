import {writable} from 'svelte/store';


export const dirty=writable(false);
export const thecm=writable(null);
export const cursorline=writable(0);
export const videoId=writable('')
export const videoSeekTo=writable(0);

export const localfile=writable();
export const juan=writable(1);
export const pb=writable(1);
export const filename=writable('');

export const maxjuan=writable(1);
export const maxpage=writable(1);
export const maxline=writable(1);
export const replacing=writable(false);
export const player=writable(null)