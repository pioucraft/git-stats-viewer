<script>
    let { data } = $props();

    const logs = JSON.parse(data.logs);
</script>

{#each logs.all as log}
    <p>{JSON.stringify(log)}</p>
{/each}
