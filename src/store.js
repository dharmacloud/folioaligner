import {updateSettings,settings} from './savestore.js'
import {writable} from 'svelte/store';

export const activefolioid=writable(settings.activefolioid)
export const panepos=writable(settings.panepos)
export const dirty=writable(false);
export const thecm=writable(null);
export const cursorline=writable(0);

export const localfile=writable();
export const juan=writable(1);
export const pb=writable(1);
export const filename=writable('');


export const maxjuan=writable(1);
export const maxpage=writable(1);
export const maxline=writable(1);
export const replacing=writable(false);
export const player=writable(null)
export const swiper=writable(null)

const host=document.location.host;
const localhost=~host.indexOf('127.0.0.1')||~host.indexOf('localhost');
export const foliopath=writable(  localhost?'folio/':'https://dharmacloud.github.io/swipegallery/folio/' );

activefolioid.subscribe((activefolioid)=>updateSettings({activefolioid}));
panepos.subscribe((panepos)=>updateSettings({panepos}))