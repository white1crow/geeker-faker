<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import http from '@/api/index'
// onMounted(() => {
//   http
//     .get('/geeker/menu/list')
//     .then((res) => {
//       console.log(res)
//     })
//     .catch((err) => console.log(err))
//   http.get('/geeker/menu/list').then((res) => {
//     console.log(res)
//   })
// })
</script>
<template>
  <RouterView />
</template>
