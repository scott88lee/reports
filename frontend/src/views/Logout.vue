<template><div></div></template>

<script>
export default {
	name: 'logout',
	mounted() {
		const vue = this;
		vue.$sso.doLogout(function(){
			vue.$router.push({ name: 'home' });
		});
	},
};
</script>

