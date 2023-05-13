import {writable} from 'svelte/store';

export const segments=writable([]);
export const dirty=writable(false);
export const thecm=writable(null);
export const cursorline=writable(0);
export const thepdf=writable(null);
export const imageurl=writable('');  
export const maxpage=writable(0);