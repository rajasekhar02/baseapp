<!-- Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021 -->
<!--
File Name: erDataPicker.vue
Description: This file is the extenstion of functionality of the element ui data picker component to work as the google dashboard data picker
-->
<template>
  <er-date-range-picker
    v-on="inputListeners"
    :class="computedDatePickerClass"
    v-model="$attrs.value"
    :type="$attrs.type ? $attrs.type : 'daterange'"
    align="center"
    :size="$attrs.size ? $attrs.size : 'mini'"
    :popper-class="`er-date-picker-popper ${$attrs['popper-class'] || ''}`"
    :format="$attrs.format || DATE_OBJ_DATE_FORMAT_WITH_YEAR"
    :unlink-panels="$attrs['unlink-panels'] || true"
    :range-separator="$t('Comn_to')"
    :start-placeholder="$t('Comm_Start')"
    :end-placeholder="$t('Comn_End')"
    :value-format="$attrs['value-format']"
    :picker-options="pickerOptions"
    :clearable="$attrs.clearable || false"
    :disabled="$attrs.disabled || false"
  ></er-date-range-picker>
</template>

<script>
import dateUtils from "@/utils/dateUtils";
import erDateRangePicker from "@/components/erDateRangePicker.js";
import "element-ui/lib/theme-chalk/date-picker.css";
export default {
  props: {
    timeZoneString: {
      required: true,
      default: 0
    },
    arrShortcuts: {
      type: Array,
      default: undefined
    },
    availableDays: {
      type: Number,
      default: -1
    },
    disableDateMethod: {
      type: Function,
      default: undefined
    }
  },
  components: { erDateRangePicker },
  created() {
    this.dateRange = this.$attrs.value;
  },
  inheritAttrs: false,
  computed: {
    inputListeners: function() {
      var vm = this;
      // `Object.assign` merges objects together to form a new object
      return Object.assign(
        {},
        // We add all the listeners from the parent
        this.$listeners,
        // Then we can add custom listeners or override the
        // behavior of some listeners.
        {
          // This ensures that the component works with v-model
          input: function(event) {
            vm.$emit("input", event);
          }
        }
      );
    },
    getAvailableDays() {
      return this.availableDays;
    },
    computedDatePickerClass: function() {
      const classList = ["date-picker"];
      if (!this.$attrs.clearable) {
        classList.push("hide-clear-icon");
      }
      return classList.join(" ");
    },
    pickerOptions() {
      if (this.$attrs["picker-options"]) return this.$attrs["picker-options"];
      let shortCuts = this.parseShortCuts();
      if ((this.arrDatePickerShortCuts || []).length) {
        shortCuts = this.parseShortCuts(this.arrDatePickerShortCuts);
      }
      const disabledDateMethod =
        this.disableDateMethod ||
        (time => {
          return dateUtils.isAfter(
            time,
            dateUtils.getCurrDateInGivenTZ(this.timeZoneString)
          );
        });
      return [
        { prop: "disabledDate", value: disabledDateMethod },
        { prop: "shortcuts", value: shortCuts }
      ].reduce((acc, pickerOption) => {
        if (!pickerOption.value) {
          return acc;
        }
        acc[pickerOption.prop] = pickerOption.value;
        return acc;
      }, {});
    }
  },
  data: function() {
    return {
      dateRange: [new Date(), new Date()],
      DATE_OBJ_DATE_FORMAT_WITH_YEAR: "yyyy-mm-dd",
      availableDaysNumb: 0
    };
  },
  methods: {
    handleValueChange: function() {},
    getShortCutObj(
      no,
      unit,
      customText = undefined,
      fromCurrent = true,
      dateQueryType = "PAST"
    ) {
      return {
        no,
        unit,
        text:
          customText || `${this.$t("Comn_last")} ${no} ${this.$tc(unit, no)}`,
        fromCurrent,
        dateQueryType
      };
    },
    getFormat(date) {
      return dateUtils.formatDate(
        date,
        this.$attrs["value-format"] ||
          this.$commonUtils.DATE_OBJ_DATE_VALUE_FORMAT
      );
    },
    isRangeValid(value, type, availableDays) {
      const types = {
        minutes: 0,
        hours: 0,
        days: 1,
        months: 30
      };
      if (availableDays === -1) {
        return true;
      } else if (value * types[type] <= availableDays) {
        return true;
      } else {
        return false;
      }
    },
    getFilteredPickerOptions(shortcuts) {
      const defaultShortCuts = [
        dateUtils.getDatePickerShortcut(
          1,
          "days",
          this.$t("Comn_yesterday"),
          false
        ),
        dateUtils.getDatePickerShortcut(7, "days", undefined),
        dateUtils.getDatePickerShortcut(15, "days", undefined),
        dateUtils.getDatePickerShortcut(30, "days", undefined),
        dateUtils.getDatePickerShortcut(3, "months", undefined),
        dateUtils.getDatePickerShortcut(6, "months", undefined)
      ];
      const options = shortcuts || this.arrShortcuts || defaultShortCuts;
      // filter shortcuts using the disable date
      const filteredRange = options.filter(option =>
        this.isRangeValid(option.no, option.unit, this.availableDays)
      );
      return filteredRange;
    },
    parseShortCuts(shortcuts) {
      const unitMap = {
        months: {
          startMethod: "startOfMonth",
          unit: "days",
          endMethod: "endOfMonth"
        },
        days: {
          startMethod: "startOfDay",
          unit: "days",
          endMethod: "endOfDay"
        },
        hours: {
          startMethod: "startOfHour",
          endMethod: "endOfHour",
          unit: "minutes"
        },
        minutes: {
          startMethod: "startOfMinute",
          endMethod: "endOfMinute",
          unit: "seconds"
        },
        seconds: {
          startMethod: "startOfSecond",
          endMethod: "endOfSecond",
          unit: "milliseconds"
        }
      };
      const filters = this.getFilteredPickerOptions(shortcuts);
      return filters.length === 0
        ? undefined
        : filters.map(shortCut => {
            return {
              text: shortCut.text,
              onClick: picker => {
                let end = dateUtils.getCurrDateInGivenTZ(this.timeZoneString);
                let start = dateUtils.getCurrDateInGivenTZ(this.timeZoneString);
                if (shortCut.fromCurrent && shortCut.unit === "days") {
                  shortCut.no--;
                }
                switch (shortCut.dateQueryType) {
                  case "PAST":
                    start = dateUtils.subtract(end, {
                      [shortCut.unit]: shortCut.no
                    });
                    break;
                  case "FUTURE":
                    end = dateUtils.add(start, {
                      [shortCut.unit]: shortCut.no
                    });
                    break;
                }
                if (!shortCut.fromCurrent) {
                  switch (shortCut.dateQueryType) {
                    case "FUTURE":
                      start = dateUtils.add(
                        shortCut.doRound
                          ? dateUtils[unitMap[shortCut.unit].startMethod](start)
                          : start,
                        {
                          [unitMap[shortCut.unit].unit]: 1
                        }
                      );
                      break;
                    case "PAST":
                      end = dateUtils.subtract(
                        shortCut.doRound
                          ? dateUtils[unitMap[shortCut.unit].endMethod](end)
                          : end,
                        {
                          [unitMap[shortCut.unit].unit]: 1
                        }
                      );
                      break;
                  }
                }
                picker.$emit("pick", [
                  this.getFormat(start),
                  this.getFormat(end)
                ]);
              }
            };
          });
    }
  }
};
</script>

<style lang="scss">
@mixin input-font-size {
  @include responsiveProperty(
    font-size,
    $app_font_size_small,
    $app_font_size_1,
    $app_font_size_2
  );
}
.el-date-table {
  @include input-font-size;
}
.er-date-picker-popper {
  .el-picker-panel__sidebar {
    width: 120px;
  }
  .el-time-spinner {
    .el-time-spinner__wrapper:first-child {
      .el-scrollbar__thumb {
        height: 40px;
      }
    }
    .el-time-spinner__wrapper:nth-child(2) {
      .el-scrollbar__thumb {
        height: 17px;
      }
    }
  }
  .el-picker-panel__shortcut {
    @include responsiveProperty(
      font-size,
      $app_font_size_small,
      $app_font_size_1,
      $app_font_size_2
    );
  }
}
.el-range-editor--mini .el-range-separator {
  // @include input-font-size;
  width: 10%;
}
.el-picker-panel__footer {
  border-top: 1px solid #e4e4e4;
  padding: 4px;
  text-align: right;
  background-color: #fff;
  position: relative;
  font-size: 0;
  margin-left: 120px;
}
.date-picker {
  box-sizing: border-box;
  position: relative;
  &.el-date-editor--daterange.el-input,
  &.el-date-editor--daterange.el-input__inner,
  &.el-date-editor--timerange.el-input,
  &.el-date-editor--datetimerange.el-input,
  &.el-date-editor--datetimerange.el-input__inner,
  &.el-date-editor--timerange.el-input__inner,
  &.el-date-editor--date {
    @include responsiveProperty(width, 170px, 220px, 350px);
    @include input-font-size;
  }
  &.el-range-editor.el-input__inner {
    display: flex;
    align-items: baseline;
    padding: 5px 10px;
  }
  &.el-date-editor .el-range-input,
  &.el-input__inner,
  &.el-date-editor .el-range-separator {
    line-height: 1.15;
    height: unset;
    @include small-text;
  }
  .el-range__close-icon,
  .el-range__icon {
    line-height: 1.25;
  }
  &.el-date-editor .el-range__icon {
    @include icon-size(icon-font, prefix);
  }
  .el-range-input {
    @include input-font-size;
    width: 45%;
    // @include responsiveProperty(padding-bottom, 0px, 1px, 1px);
  }
  &.hide-clear-icon {
    .el-range__close-icon {
      display: none;
    }
  }
}
</style>
