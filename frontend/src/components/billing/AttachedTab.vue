<template>
  <div v-if="data.length > 0" class="ui top attached tabular menu">
    <a v-for="arr in data" :key="arr" class="billingTab item" :id="arr" @click="toggle($event)">
      {{ arr }}
    </a>
  </div>
</template>

<style scoped>
.ui.tabular.menu {
  border-bottom: 0;
}
</style>


<script>
import store from "../../store"
export default {
  props: {
    data: Array
  },
  data(){
    return {
      tabIndex: this.$store.state.billing.tabIndex
    }
  },
  mounted: function() {
    let tabs = document.getElementsByClassName('billingTab');

    tabs[0].className = "billingTab item active";
  },
  methods: {
    toggle(e){
      console.log(e.target)

      let tabs = document.getElementsByClassName('billingTab');
      for (let i=0; i<tabs.length; i++){
          tabs[i].className = "billingTab item"
      }
      document.getElementById(e.target.id).className = "billingTab item active";

      let x = document.getElementsByClassName('billingTab item');

      for (let i=0; i<x.length; i++){
        if (x[i].id == e.target.id){
          console.log(i)
          store.commit('billIndex', i);
        }
      }
      console.log(this.$store.state.billing.tabIndex);

    }
  }
}
</script>
