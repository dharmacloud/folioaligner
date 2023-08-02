import {updateSettings,settings} from './savestore.js'
import {writable} from 'svelte/store';

export const activefolioid=writable('')
export const panepos=writable(settings.panepos)
export const dirty=writable(0);
export const thecm=writable(null);
export const cursorline=writable(0);
export const cursormark=writable(0);//游標位置  行*17 + 字
export const cursorchar=writable('')
export const folioLines=writable(5);
export const localfile=writable();
export const filename=writable('');
export const editfreely=writable('off')
export const activepb=writable(0);
export const savedpos=writable(settings.savedpos);

export const maxjuan=writable(1);
export const maxpage=writable(1);
export const maxline=writable(1);
export const replacing=writable(false);
export const player=writable(null)
export const swiper=writable(null)

const host=document.location.host;
const localhost=~host.indexOf('127.0.0.1')||~host.indexOf('localhost');
export const foliopath=writable(  localhost?'folio/':'https://dharmacloud.github.io/swipegallery/folio/' );

panepos.subscribe((panepos)=>updateSettings({panepos}))
export let canedit=false;
editfreely.subscribe((e)=>canedit=e=='on')

savedpos.subscribe((savedpos)=>updateSettings({savedpos}));

