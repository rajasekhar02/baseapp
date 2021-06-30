<!-- Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021 -->
<!--
File Name: timePicker.vue
Description: This file contains vue time picker component which is useful all over pondlogs site
-->
<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div v-show="visible" class="el-time-panel el-popper" :class="popperClass">
      <div
        class="el-time-panel__content"
        :class="{ 'has-seconds': showSeconds }"
      >
        <timeSpinner
          ref="spinner"
          @change="handleChange"
          :arrow-control="useArrow"
          :show-seconds="showSeconds"
          :am-pm-mode="amPmMode"
          @select-range="setSelectionRange"
          :date="date"
        >
        </timeSpinner>
      </div>
      <div class="el-time-panel__footer">
        <button
          type="button"
          class="el-time-panel__btn cancel"
          @click="handleCancel"
        >
          {{ t("el.datepicker.cancel") }}
        </button>
        <button
          type="button"
          class="el-time-panel__btn"
          :class="{ confirm: !disabled }"
          @click="handleConfirm()"
        >
          {{ t("el.datepicker.confirm") }}
        </button>
      </div>
    </div>
  </transition>
</template>
<script>
import Time from "element-ui/packages/date-picker/src/panel/time";
import timeSpinner from "./timeSpinner.vue";
import i18n from "@/plugins/i18n";
import { clearMilliseconds } from "element-ui/src/utils/date-util";

export default {
  extends: Time,
  components: { timeSpinner },
  methods: {
    t(...args) {
      return i18n.t(...args);
    },
    handleChange(date) {
      // this.visible avoids edge cases, when use scrolls during panel closing animation
      if (this.visible) {
        this.date = clearMilliseconds(date);
        // if date is out of range, do not emit
        // if (this.isValidValue(this.date)) {
        this.$emit("pick", this.date, true);
        // }
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
