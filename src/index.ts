import App from './app.svelte';
import {CMActiveLine} from './activeline.js';
CMActiveLine();
const app = new App({target: document.body});
document.querySelector("#bootmessage").innerHTML='';
export default app;