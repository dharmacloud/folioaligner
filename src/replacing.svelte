<script>
import {thecm} from './store.js';

$:sel=$thecm.doc.getSelection();

</script>

<input value={sel}/>