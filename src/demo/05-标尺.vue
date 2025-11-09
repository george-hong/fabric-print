<template>
  <div class="ruler-demo">
    <Ruler
    :horiSize="8"
    :vertSize="8"
    >
        <div style="width: 50mm; height: 50mm; background-color: red;">
            11112123444
        </div>
    </Ruler>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Ruler from '@/components/ruler.vue';

onMounted(() => {

});
</script>

<style scoped>
.ruler-demo {
  height: 100%;
  background-color: #f0f0f0;
  padding: 0;
}
</style>