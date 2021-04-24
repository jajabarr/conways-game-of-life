<script lang="typescript">
  export let value: number;
  export let title: string;

  let bindedInputValue = 0;
  let previousBlockSize: number = 0;

  $: {
    if (!isNaN(+bindedInputValue) && bindedInputValue > 0) {
      value = bindedInputValue = previousBlockSize = +bindedInputValue;
    } else {
      bindedInputValue =
        bindedInputValue.toString() !== '' ? previousBlockSize : undefined;
    }
  }
</script>

<div>
  <span>{title}</span>
  <input bind:value={bindedInputValue} />
</div>

<style>
  div {
    display: 'flex';
    justify-content: center;
    flex-direction: row;
    align-items: center;

    margin: 0 10px 0 10px;

    /* width: 400px; */
  }

  span {
    text-transform: uppercase;
  }
</style>
