<!-- Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021 -->
<!--
File Name: timeSpinner.vue
Description: This file contains vue time spinner component used in date picker component for time selection
-->
<script>
import timeSpinner from "element-ui/packages/date-picker/src/basic/time-spinner";
import { getRangeHours, getRangeMinutes } from "./dateUtil.js";
export default {
  extends: timeSpinner,
  computed: {
    hoursList() {
      return getRangeHours(this.selectableRange);
    },
    minutesList() {
      return getRangeMinutes(this.selectableRange, this.hours);
    }
  }
};
</script>

<style lang="scss" scoped></style>
