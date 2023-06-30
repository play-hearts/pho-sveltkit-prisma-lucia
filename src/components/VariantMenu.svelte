<script lang="ts">
    export let value: string;
</script>

<label for="variant"> <strong>Game Variant:</strong> </label>
<select id="variant" name="variant" value="{value}">
    <option value="STANDARD">Hearts: (standard)</option>
    <option value="JACK">Hearts: (jack diamonds -10pts)</option>
    <option value="SPADES">Spades</option>
</select>
