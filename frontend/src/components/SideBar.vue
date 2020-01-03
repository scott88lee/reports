<template>
  <div id="sidebar" class="ui thin sidebar vertical labeled menu">
    <div class="item">&nbsp;</div>
    <a id="transactions" class="item" @click="transactions()">
      Transaction List
    </a>
    <a id="funding" class="item" @click="funding()">
      Funding Report
    </a>
    <a id="billing" class="item" @click="billing()">
      Billing Report
    </a>
    <div class="item" v-if="admin">
      <router-link to="/deep">Deep Query</router-link>
    </div>
    <div class="item" v-if="admin">
      <router-link to="/tools">Dev Tools</router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: "SideBar",
  computed: {
    admin() {
      //Implement role checking for Deep link
      if (
        this.$store.state.credentials.role == "admin" ||
        this.$store.state.credentials.role == "Admin"
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    transactions () {
      $('#billing').removeClass('active')
      $('#funding').removeClass('active')
      $('#transactions').addClass('active')

      this.$router.push('/transactions')
    },
    funding () {
      $('#transactions').removeClass('active')
      $('#billing').removeClass('active')
      $('#funding').addClass('active')

      this.$router.push('/funding')
    },
    billing () {
      $('#transactions').removeClass('active')
      $('#funding').removeClass('active')
      $('#billing').addClass('active')

      this.$router.push('/billing')
    }
  },
  mounted() {
    switch (this.$route.name.toLowerCase()) {
      case 'home':
        $('#transactions').addClass('active')
        break;
      case 'login':
        $('#transactions').addClass('active')
        break;
      default:
        $('#' + this.$route.name.toLowerCase()).addClass('active')
        break;
    }

    // Initiate the sidebar.
    $("#sidebar")
      .sidebar({
        context: $("#sidebar-context"),
        dimPage: false,
        closable: false
      })
      .sidebar("setting", "transition", "push page")
      .sidebar("show");

    // check screen size and toggle the sidebar.
    window.addEventListener("resize", () => {
      if ($(window).width() < 1024) {
        $("#sidebar").sidebar("hide");
        $("#main-grid")
          .addClass("center aligned")
      } else {
        $("#sidebar").sidebar("show");
        $("#main-grid")
          .removeClass("center aligned")
      }
    });
  }
};
</script>

<style scoped>
  .active.item {
    background: #3f88c9 !important;
    color: #fff !important;
  }
</style>

<style>
#sidebar-context {
  min-height: 100vh;
}

#sidebar {
  z-index: 100 !important;
}
</style>
