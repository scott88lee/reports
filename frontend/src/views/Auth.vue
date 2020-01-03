<template>
</template>

<script>

export default {
    name: 'auth',
    mounted() {
        const vue = this;
        vue.$sso.checkSSO(vue.$router);
    }
}
</script>