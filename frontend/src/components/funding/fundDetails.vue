<template>
  <div id="csvDL" class="ui modal">
    <div class="header">CSV Download</div>
    <div class="content">
      <h3>Transaction details</h3>
      <p>Please kindly wait for download to begin, you may also click the link below if it doesn't automatically start.
        <br><br>
        This link will expire in 5 minutes.<br>
        <a id="detailLink" :href="csvLink">Download CSV here.</a>
      </p>

    </div>
  </div>
</template>

<script>
export default {
    props: ['csvLink']
};
</script>

<style>
a {
    word-break: break-all;
}
</style>
