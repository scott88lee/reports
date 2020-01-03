<template>
  <div>
    <div v-if="data.length > 0" class="ui attached tabular menu">
      <a v-for="(ccy, key) in data" :key="key" class="fundingTab item" :id="ccy.key + '-' + ccy.value" @click="toggle($event)">
        {{ ccy.value }}
      </a>
    </div>
  </div>
</template>

<script>
import store from "../../store"
export default {
  props: {
    data: Array
  },
  data(){
    return {
      tabIndex: this.$store.state.funding.tabIndex
    }
  },
  mounted: function() {
    // Set the first child active which might be 'SGD'
    $('.fundingTab:first-child').addClass('active')

    store.commit('fundIndex', $('.fundingTab:first-child').attr('id').split('-')[0])
  },
  methods: {
    toggle(e){
      $('.fundingTab').removeClass('active')
      $('#' + e.target.id).addClass('active')
      store.commit('fundIndex', e.target.id.split('-')[0]);
    }
  }
}
</script>
