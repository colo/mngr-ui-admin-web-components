<template>
  <div id="q-app">
    <router-view :key="$route.path +'.'+ JSON.stringify($route.query)"/>
  </div>
</template>

<script >
export default {
  name: 'App'
}
</script>
