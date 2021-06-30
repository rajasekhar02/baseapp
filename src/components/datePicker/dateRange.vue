<!-- Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021 -->
<!--
File Name: dateRange.vue
Description: This file contains vue date range picker component which is useful all over pondlogs site
-->
<template>
  <transition name="el-zoom-in-top" @after-leave="$emit('dodestroy')">
    <div
      v-show="visible"
      class="el-picker-panel el-date-range-picker el-popper"
      :class="[
        {
          'has-sidebar': $slots.sidebar || shortcuts,
          'has-time': showTime
        },
        popperClass
      ]"
    >
      <div class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar"></slot>
        <div class="el-picker-panel__sidebar" v-if="shortcuts">
          <button
            type="button"
            class="el-picker-panel__shortcut"
            v-for="(shortcut, key) in shortcuts"
            :key="key"
            @click="handleShortcutClick(shortcut)"
          >
            {{ shortcut.text }}
          </button>
        </div>

        <div class="el-picker-panel__body">
          <p
            v-if="errorMessage"
            style="color: red; text-align: center"
            class="validation-message"
          >
            <span>{{ t(errorMessage) }}</span>
          </p>

          <div class="el-date-range-picker__time-header" v-if="showTime">
            <span class="el-date-range-picker__editors-wrap">
              <span class="el-date-range-picker__time-picker-wrap">
                <el-input
                  size="small"
                  :disabled="rangeState.selecting"
                  ref="minInput"
                  :placeholder="t('el.datepicker.startDate')"
                  class="el-date-range-picker__editor"
                  :value="minVisibleDate"
                  @input="val => handleDateInput(val, 'min')"
                  @change="val => handleDateChange(val, 'min')"
                />
              </span>
              <span
                class="el-date-range-picker__time-picker-wrap"
                v-clickoutside="handleMinTimeClose"
              >
                <el-input
                  size="small"
                  :debounce="20000"
                  class="el-date-range-picker__editor"
                  :disabled="rangeState.selecting"
                  :placeholder="t('el.datepicker.startTime')"
                  :value="minVisibleTime"
                  @focus="minTimePickerVisible = true"
                  @input="val => handleTimeInput(val, 'min')"
                  @change="val => handleTimeChange(val, 'min')"
                />
                <timePicker
                  ref="minTimePicker"
                  @pick="handleMinTimePick"
                  :time-arrow-control="arrowControl"
                  :visible="minTimePickerVisible"
                  @mounted="$refs.minTimePicker.format = timeFormat"
                />
              </span>
            </span>
            <span class="el-icon-arrow-right"></span>
            <span class="el-date-range-picker__editors-wrap is-right">
              <span class="el-date-range-picker__time-picker-wrap">
                <el-input
                  size="small"
                  :debounce="1000"
                  class="el-date-range-picker__editor"
                  :disabled="rangeState.selecting"
                  :placeholder="t('el.datepicker.endDate')"
                  :value="maxVisibleDate"
                  :readonly="!minDate"
                  @input="val => handleDateInput(val, 'max')"
                  @change="val => handleDateChange(val, 'max')"
                />
              </span>
              <span
                class="el-date-range-picker__time-picker-wrap"
                v-clickoutside="handleMaxTimeClose"
              >
                <el-input
                  size="small"
                  class="el-date-range-picker__editor"
                  :disabled="rangeState.selecting"
                  :placeholder="t('el.datepicker.endTime')"
                  :value="maxVisibleTime"
                  :readonly="!minDate"
                  @focus="minDate && (maxTimePickerVisible = true)"
                  @input="val => handleTimeInput(val, 'max')"
                  @change="val => handleTimeChange(val, 'max')"
                />
                <timePicker
                  ref="maxTimePicker"
                  @pick="handleMaxTimePick"
                  :time-arrow-control="arrowControl"
                  :visible="maxTimePickerVisible"
                  @mounted="$refs.maxTimePicker.format = timeFormat"
                />
              </span>
            </span>
          </div>
          <div>
            <div class="date-header-container">
              <div class="el-date-range-picker__content is-left align-center">
                {{ t("el.datepicker.startDate") }}
              </div>
              <div class="is-right align-center">
                {{ t("el.datepicker.endDate") }}
              </div>
            </div>
            <div
              class="el-picker-panel__content el-date-range-picker__content is-left"
            >
              <div class="el-date-range-picker__header">
                <button
                  type="button"
                  @click="leftPrevYear"
                  class="el-picker-panel__icon-btn el-icon-d-arrow-left"
                ></button>
                <button
                  type="button"
                  @click="leftPrevMonth"
                  class="el-picker-panel__icon-btn el-icon-arrow-left"
                ></button>
                <button
                  type="button"
                  @click="leftNextYear"
                  v-if="unlinkPanels"
                  :disabled="!enableYearArrow"
                  :class="{ 'is-disabled': !enableYearArrow }"
                  class="el-picker-panel__icon-btn el-icon-d-arrow-right"
                ></button>
                <button
                  type="button"
                  @click="leftNextMonth"
                  v-if="unlinkPanels"
                  :disabled="!enableMonthArrow"
                  :class="{ 'is-disabled': !enableMonthArrow }"
                  class="el-picker-panel__icon-btn el-icon-arrow-right"
                ></button>
                <div>{{ leftLabel }}</div>
              </div>
              <er-date-range-table
                selection-mode="range"
                :date="leftDate"
                :default-value="defaultValue"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                setStateKey="minDate"
                :disabled-date="disabledDate"
                :cell-class-name="cellClassName"
                @changerange="handleChangeRange"
                :first-day-of-week="firstDayOfWeek"
                @pick="handleRangePick"
              />
            </div>
            <div
              class="el-picker-panel__content el-date-range-picker__content is-right"
            >
              <div class="el-date-range-picker__header">
                <button
                  type="button"
                  @click="rightPrevYear"
                  v-if="unlinkPanels"
                  :disabled="!enableYearArrow"
                  :class="{ 'is-disabled': !enableYearArrow }"
                  class="el-picker-panel__icon-btn el-icon-d-arrow-left"
                ></button>
                <button
                  type="button"
                  @click="rightPrevMonth"
                  v-if="unlinkPanels"
                  :disabled="!enableMonthArrow"
                  :class="{ 'is-disabled': !enableMonthArrow }"
                  class="el-picker-panel__icon-btn el-icon-arrow-left"
                ></button>
                <button
                  type="button"
                  @click="rightNextYear"
                  class="el-picker-panel__icon-btn el-icon-d-arrow-right"
                ></button>
                <button
                  type="button"
                  @click="rightNextMonth"
                  class="el-picker-panel__icon-btn el-icon-arrow-right"
                ></button>
                <div>{{ rightLabel }}</div>
              </div>
              <er-date-range-table
                selection-mode="range"
                :date="rightDate"
                :default-value="defaultValue"
                :min-date="minDate"
                :max-date="maxDate"
                :range-state="rangeState"
                setStateKey="maxDate"
                :disabled-date="disabledDate"
                :cell-class-name="cellClassName"
                @changerange="handleChangeRange"
                :first-day-of-week="firstDayOfWeek"
                @pick="handleRangePick"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="el-picker-panel__footer">
        <el-button
          size="mini"
          type="text"
          class="el-picker-panel__link-btn"
          @click="handleClear"
        >
          {{ t("el.datepicker.clear") }}
        </el-button>
        <el-button
          plain
          size="mini"
          class="el-picker-panel__link-btn"
          :disabled="btnDisabled"
          @click="handleConfirm(false)"
        >
          {{ t("el.datepicker.confirm") }}
        </el-button>
      </div>
    </div>
  </transition>
</template>
<script>
import dateRange from "element-ui/packages/date-picker/src/panel/date-range";
import i18n from "@/plugins/i18n";
import erDateRangeTable from "@/components/erDateRangeTable";
import timePicker from "@/components/datePicker/timePicker";
import dateUtils from "@/utils/dateUtils";
import {
  formatDate,
  isDate,
  modifyWithTimeString,
  modifyTime,
  nextMonth,
  nextDate,
  extractTimeFormat,
  extractDateFormat,
  parseDate
} from "@/components/datePicker/dateUtil.js";
const calcDefaultValue = defaultValue => {
  if (Array.isArray(defaultValue)) {
    return [new Date(defaultValue[0]), new Date(defaultValue[1])];
  } else if (defaultValue) {
    return [new Date(defaultValue), nextDate(new Date(defaultValue), 1)];
  } else {
    return [new Date(), nextDate(new Date(), 1)];
  }
};

export default {
  extends: dateRange,
  components: {
    // cuDateTable,
    erDateRangeTable,
    timePicker
  },
  data() {
    return {
      visible: true,
      errorMessage: undefined
    };
  },
  watch: {
    value(newVal) {
      if (!newVal) {
        this.minDate = null;
        this.maxDate = null;
      } else if (Array.isArray(newVal)) {
        this.minDate = isDate(newVal[0]) ? new Date(newVal[0]) : null;
        this.maxDate = isDate(newVal[1]) ? new Date(newVal[1]) : null;
        if (this.minDate) {
          this.leftDate = this.minDate;
          if (this.unlinkPanels && this.maxDate) {
            this.rightDate = this.maxDate;
          } else {
            this.rightDate = this.leftDate;
          }
        } else {
          this.leftDate = calcDefaultValue(this.defaultValue)[0];
          this.rightDate = nextMonth(this.leftDate);
        }
      }
    },
    minDate(val) {
      this.dateUserInput.min = null;
      this.timeUserInput.min = null;
      this.$nextTick(() => {
        if (this.$refs.maxTimePicker && this.maxDate) {
          const format = "HH:mm:ss";
          this.$refs.maxTimePicker.selectableRange = [
            [parseDate("00:00:00", format), parseDate("23:59:59", format)]
          ];
        }
      });
      if (val && this.$refs.minTimePicker) {
        this.$refs.minTimePicker.date = val;
        this.$refs.minTimePicker.value = val;
      }
    }
  },
  computed: {
    dateFormat() {
      if (this.format) {
        return extractDateFormat(this.format);
      }
      return "yyyy-MM-dd";
    },
    timeFormat() {
      if (this.format) {
        return extractTimeFormat(this.format);
      }
      return "HH:mm:ss";
    },
    enableMonthArrow() {
      const nextMonth = (this.leftMonth + 1) % 12;
      const yearOffset = this.leftMonth + 1 >= 12 ? 1 : 0;
      return (
        this.unlinkPanels &&
        new Date(this.leftYear + yearOffset, nextMonth) <=
          new Date(this.rightYear, this.rightMonth)
      );
    },
    enableYearArrow() {
      return (
        this.unlinkPanels &&
        this.rightYear * 12 +
          this.rightMonth -
          (this.leftYear * 12 + this.leftMonth + 1) >=
          12
      );
    },
    minVisibleDate() {
      if (this.dateUserInput.min !== null) return this.dateUserInput.min;
      if (this.minDate) return formatDate(this.minDate, this.dateFormat);
      return "";
    },
    maxVisibleDate() {
      if (this.dateUserInput.max !== null) return this.dateUserInput.max;
      if (this.maxDate || this.minDate) {
        return formatDate(this.maxDate || this.minDate, this.dateFormat);
      }
      return "";
    }
  },
  methods: {
    t(...args) {
      return i18n.t(...args);
    },
    handleTimeInput(value, type) {
      this.timeUserInput[type] = value;
      if (value.length !== this.timeFormat.length) return;
      this.$lodash.debounce(() => {
        const parsedValue = parseDate(value, this.timeFormat);
        if (parsedValue) {
          if (type === "min") {
            this.minDate = modifyTime(
              this.minDate,
              parsedValue.getHours(),
              parsedValue.getMinutes(),
              parsedValue.getSeconds()
            );
            this.$nextTick(() => this.$refs.minTimePicker.adjustSpinners());
          } else {
            this.maxDate = modifyTime(
              this.maxDate,
              parsedValue.getHours(),
              parsedValue.getMinutes(),
              parsedValue.getSeconds()
            );
            this.$nextTick(() => this.$refs.maxTimePicker.adjustSpinners());
          }
        }
      }, 500);
    },
    handleTimeChange(value, type) {
      const parsedValue = parseDate(value, this.timeFormat);
      if (parsedValue) {
        if (type === "min") {
          this.minDate = modifyTime(
            this.minDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          // if (this.minDate > this.maxDate) {
          //   this.maxDate = this.minDate;
          // }
          // this.$refs.minTimePicker.value = this.minDate;
          this.minTimePickerVisible = false;
        } else {
          this.maxDate = modifyTime(
            this.maxDate,
            parsedValue.getHours(),
            parsedValue.getMinutes(),
            parsedValue.getSeconds()
          );
          // if (this.maxDate < this.minDate) {
          //   this.minDate = this.maxDate;
          // }
          // this.$refs.maxTimePicker.value = this.minDate;
          this.maxTimePickerVisible = false;
        }
      }
    },
    isBeforeDate(first, second) {
      const arrDates = [first, second].map(x => dateUtils.startOfDay(x));
      return dateUtils.isEqual(...arrDates) || dateUtils.isBefore(...arrDates);
    },
    isBeforeTime(first, second) {
      return first.getTime() < second.getTime();
    },
    isValidValue(value) {
      const conditions = [
        value => Array.isArray(value),
        value => value,
        value => value[0],
        value => value[1],
        value => isDate(value[0]),
        value => isDate(value[1]),
        value => value[0].getTime() <= value[1].getTime(),
        value =>
          typeof this.disabledDate === "function"
            ? !this.disabledDate(value[0]) && !this.disabledDate(value[1])
            : true
      ];
      const isValid = conditions.every(x => x(value));
      if (!isValid) {
        this.handleErrors(value);
      } else {
        this.errorMessage = undefined;
      }
      return isValid;
    },
    handleErrors(value) {
      if (this.disabledDate(value[0]) || this.disabledDate(value[1])) {
        this.errorMessage = "Comn_invalid_data_selection";
      }
      if (!this.isBeforeDate(new Date(value[0]), new Date(value[1]))) {
        this.errorMessage = "Comn_end_date_must_be_greater_equal_start_date";
      } else if (
        this.showTime &&
        !this.isBeforeTime(new Date(value[0]), new Date(value[1]))
      ) {
        this.errorMessage = "Comn_end_time_must_be_greater_equal_start_time";
      }
    },
    handleMinTimePick(value, visible, first) {
      this.minDate = this.minDate || new Date();
      if (value) {
        this.minDate = modifyTime(
          this.minDate,
          value.getHours(),
          value.getMinutes(),
          value.getSeconds()
        );
      }
      if (!first) {
        this.minTimePickerVisible = visible;
      }
    },
    handleMaxTimePick(value, visible, first) {
      if (this.maxDate && value) {
        this.maxDate = modifyTime(
          this.maxDate,
          value.getHours(),
          value.getMinutes(),
          value.getSeconds()
        );
      }
      if (!first) {
        this.maxTimePickerVisible = visible;
      }
    },
    handleRangePick(val) {
      const defaultTime = this.defaultTime || [];
      const minDate = modifyWithTimeString(val.minDate, defaultTime[0]);
      const maxDate = modifyWithTimeString(val.maxDate, defaultTime[1]);
      if (this.maxDate === maxDate && this.minDate === minDate) {
        return;
      }
      this.onPick && this.onPick(val);
      this.maxDate = maxDate;
      this.minDate = minDate;
      // workaround for https://github.com/ElemeFE/element/issues/7539, should remove this block when we don't have to care about Chromium 55 - 57
      setTimeout(() => {
        this.maxDate = maxDate;
        this.minDate = minDate;
      }, 10);
      // if (!close || this.showTime) return;
      // this.handleConfirm(true);
    }
  }
};
</script>

<style lang="scss" scoped>
.date-header-container {
  .el-date-range-picker__content {
    padding-bottom: 0px;
    padding-top: 0px;
    padding-left: 10px;
    padding-right: 0px;
    // padding: 0px;
  }
}

.el-date-range-picker__content {
  padding-bottom: 16px;
  padding-top: 0px;
  padding-left: 16px;
  padding-right: 16px;
  // padding: 0px;
}
.el-picker-panel__shortcut {
  font-size: 11px;
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
.el-picker-panel__body {
  p {
    font-size: 11px;
  }
  @media screen and (min-width: 1440px) {
    p {
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
.el-picker-panel [slot="sidebar"] + .el-picker-panel__body,
.el-picker-panel__sidebar + .el-picker-panel__body {
  margin-left: 120px;
}
</style>
