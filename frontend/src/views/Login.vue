<template>
</template>

<script>

export default {
    name: 'login',
    mounted() {
        const vue = this;
        vue.$sso.doLogin(vue.$route, vue.$router);
    }
}
</script>