<script lang="ts">
    export let seat: string;
    export let value: string = "s:random";
</script>

<label for="{seat}"> <strong>{seat}</strong> </label>
<select id="{seat}" name="{seat}" value="{value}">
    <option value="s:random">Random Play</option>
    <option value="s:locard">Play lowest legal card</option>
    <option value="s:hicard">Play highest legal card</option>
</select>
