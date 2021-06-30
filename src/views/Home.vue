<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" />
    <dateUtils></dateUtils>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from "@/components/HelloWorld.vue";
import dateUtils from "@/components/datesUtils.vue";
export default {
  name: "Home",
  components: {
    HelloWorld,
    dateUtils
  }
};
</script>
