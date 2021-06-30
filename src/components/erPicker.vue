<!-- Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021 -->
<!--
File Name: erPicker.vue
Description: This file contains the component which is the extension of the element ui picker js component
-->
<script>
import Picker from "element-ui/packages/date-picker/src/picker";

export default {
  extends: Picker
};
</script>

<style lang="scss" scoped>
.el-date-editor {
  .el-range__icon {
    font-size: 11px;
  }
  @media screen and (min-width: 1440px) {
    .el-range-input {
      font-size: 11px;
    }
  }
  @media screen and (min-width: 1440px) and (max-width: 1920px) {
    .el-range-input {
      font-size: 13px;
    }
  }
  @media screen and (min-width: 1920px) {
    .el-range-input {
      font-size: 16px;
    }
  }
}
.el-range-editor--mini {
  .el-range-input {
    font-size: 11px;
  }
  @media screen and (min-width: 1440px) {
    .el-range-input {
      font-size: 11px;
    }
  }
  @media screen and (min-width: 1440px) and (max-width: 1920px) {
    .el-range-input {
      font-size: 13px;
    }
  }
  @media screen and (min-width: 1920px) {
    .el-range-input {
      font-size: 16px;
    }
  }
}
</style>
