/**
Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021
**/
/**
File Name: erDateRangePicker.js
Description: This is the modified version of the picker.js in element ui used for modifying the functionality of the date picker according to the pondlogs
*/
import DatePanel from "element-ui/packages/date-picker/src/panel/date";
import {
  formatDate,
  parseDate,
  isDateObject,
  getWeekNumber
} from "@/components/datePicker/dateUtil.js";
import Vue from "vue";
import dateRange from "@/components/datePicker/dateRange.vue";
import Picker from "@/components/erPicker.vue";
import i18n from "@/plugins/i18n";
function getPanel(type) {
  const typeToPanel = {
    // daterange: DateRangePanel,
    // datetimerange: DateRangePanel,
    daterange: dateRange,
    datetimerange: dateRange
    // cudaterange: erDateRange,
    // cudatetimerange: erDateRange,
  };
  return typeToPanel[type] || DatePanel;
}
const DEFAULT_FORMATS = {
  date: "yyyy-MM-dd",
  month: "yyyy-MM",
  datetime: "yyyy-MM-dd HH:mm:ss",
  time: "HH:mm:ss",
  week: "yyyywWW",
  timerange: "HH:mm:ss",
  daterange: "yyyy-MM-dd",
  monthrange: "yyyy-MM",
  datetimerange: "yyyy-MM-dd HH:mm:ss",
  year: "yyyy"
};
const DATE_FORMATTER = function(value, format) {
  if (format === "timestamp") return value.getTime();
  return formatDate(value, format);
};
const DATE_PARSER = function(text, format) {
  if (format === "timestamp") return new Date(Number(text));
  return parseDate(text, format);
};
const RANGE_FORMATTER = function(value, format) {
  if (Array.isArray(value) && value.length === 2) {
    const start = value[0];
    const end = value[1];

    if (start && end) {
      return [DATE_FORMATTER(start, format), DATE_FORMATTER(end, format)];
    }
  }
  return "";
};
const RANGE_PARSER = function(array, format, separator) {
  if (!Array.isArray(array)) {
    array = array.split(separator);
  }
  if (array.length === 2) {
    const range1 = array[0];
    const range2 = array[1];

    return [DATE_PARSER(range1, format), DATE_PARSER(range2, format)];
  }
  return [];
};
const HAVE_TRIGGER_TYPES = [
  "date",
  "datetime",
  "time",
  "time-select",
  "week",
  "month",
  "year",
  "daterange",
  "monthrange",
  "timerange",
  "datetimerange",
  "dates",
  "cudaterange",
  "cudatetimerange"
];
const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {
      if (!value) return "";
      return `${value}`;
    },
    parser(text) {
      if (text === undefined || text === "") return null;
      return text;
    }
  },
  week: {
    formatter(value, format) {
      const week = getWeekNumber(value);
      const month = value.getMonth();
      const trueDate = new Date(value);
      if (week === 1 && month === 11) {
        trueDate.setHours(0, 0, 0, 0);
        trueDate.setDate(
          trueDate.getDate() + 3 - ((trueDate.getDay() + 6) % 7)
        );
      }
      let date = formatDate(trueDate, format);

      date = /WW/.test(date)
        ? date.replace(/WW/, week < 10 ? `0${week}` : week)
        : date.replace(/W/, week);
      return date;
    },
    parser(text, format) {
      // parse as if a normal date
      return TYPE_VALUE_RESOLVER_MAP.date.parser(text, format);
    }
  },
  date: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  datetime: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  daterange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  monthrange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  datetimerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  cudaterange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  cudatetimerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  timerange: {
    formatter: RANGE_FORMATTER,
    parser: RANGE_PARSER
  },
  time: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  month: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  year: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER
  },
  number: {
    formatter(value) {
      if (!value) return "";
      return `${value}`;
    },
    parser(text) {
      const result = Number(text);

      if (!isNaN(text)) {
        return result;
      }
      return null;
    }
  },
  dates: {
    formatter(value, format) {
      return value.map(date => DATE_FORMATTER(date, format));
    },
    parser(value, format) {
      return (typeof value === "string" ? value.split(", ") : value).map(date =>
        date instanceof Date ? date : DATE_PARSER(date, format)
      );
    }
  }
};
const parseAsFormatAndType = (
  value,
  customFormat,
  type,
  rangeSeparator = "-"
) => {
  if (!value) return null;
  const { parser } =
    TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default;
  const format = customFormat || DEFAULT_FORMATS[type];
  return parser(value, format, rangeSeparator);
};
const formatAsFormatAndType = (value, customFormat, type) => {
  if (!value) return null;
  const { formatter } =
    TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default;
  const format = customFormat || DEFAULT_FORMATS[type];
  return formatter(value, format);
};
export default {
  mixins: [Picker],
  name: "CuDatePicker",
  props: {
    type: {
      type: String,
      default: "date"
    },
    timeArrowControl: Boolean
  },
  computed: {
    displayValue() {
      const formattedValue = formatAsFormatAndType(
        this.parsedValue,
        this.format,
        this.type,
        this.rangeSeparator
      );
      if (Array.isArray(this.userInput)) {
        return [
          this.userInput[0] || (formattedValue && formattedValue[0]) || "",
          this.userInput[1] || (formattedValue && formattedValue[1]) || ""
        ];
      }
      if (this.userInput !== null) {
        return this.userInput;
      }
      if (formattedValue) {
        return this.type === "dates"
          ? formattedValue.join(", ")
          : formattedValue;
      }
      return "";
    },
    parsedValue() {
      if (!this.value) return this.value; // component value is not set
      if (this.type === "time-select") return this.value; // time-select does not require parsing, this might change in next major version

      const valueIsDateObject =
        isDateObject(this.value) ||
        (Array.isArray(this.value) && this.value.every(isDateObject));
      if (valueIsDateObject) {
        return this.value;
      }

      if (this.valueFormat) {
        return (
          parseAsFormatAndType(
            this.value,
            this.valueFormat,
            this.type,
            this.rangeSeparator
          ) || this.value
        );
      }
      // NOTE: deal with common but incorrect usage, should remove in next major version
      // user might provide string / timestamp without value-format, coerce them into date (or array of date)
      return Array.isArray(this.value)
        ? this.value.map(val => new Date(val))
        : new Date(this.value);
    }
  },
  watch: {
    type(type) {
      if (this.picker) {
        this.unmountPicker();
        this.panel = getPanel(type);
        this.mountPicker();
      } else {
        this.panel = getPanel(type);
      }
    }
  },
  created() {
    this.panel = getPanel(this.type);
  },
  methods: {
    t(...args) {
      return i18n.t(...args);
    },
    mountPicker() {
      this.picker = new Vue(this.panel).$mount();
      this.picker.defaultValue = this.defaultValue;
      this.picker.defaultTime = this.defaultTime;
      this.picker.popperClass = this.popperClass;
      this.popperElm = this.picker.$el;
      this.picker.width = this.reference.getBoundingClientRect().width;
      this.picker.showTime = [
        "datetime",
        "datetimerange",
        "cudatetimerange"
      ].includes(this.type);
      this.picker.selectionMode = this.selectionMode;
      this.picker.unlinkPanels = this.unlinkPanels;
      this.picker.arrowControl =
        this.arrowControl || this.timeArrowControl || false;
      this.$watch("format", format => {
        this.picker.format = format;
      });
      const updateOptions = () => {
        const options = this.pickerOptions;
        if (options && options.selectableRange) {
          let ranges = options.selectableRange;
          const { parser } = TYPE_VALUE_RESOLVER_MAP.datetimerange;
          const format = DEFAULT_FORMATS.timerange;
          ranges = Array.isArray(ranges) ? ranges : [ranges];
          this.picker.selectableRange = ranges.map(range =>
            parser(range, format, this.rangeSeparator)
          );
        }
        for (const option in options) {
          if (
            // eslint-disable-next-line
            options.hasOwnProperty(option) &&
            // 忽略 time-picker 的该配置项
            option !== "selectableRange"
          ) {
            this.picker[option] = options[option];
          }
        }
        // main format must prevail over undocumented pickerOptions.format
        if (this.format) {
          this.picker.format = this.format;
        }
      };
      updateOptions();
      this.unwatchPickerOptions = this.$watch(
        "pickerOptions",
        () => updateOptions(),
        {
          deep: true
        }
      );
      this.$el.appendChild(this.picker.$el);
      this.picker.resetView && this.picker.resetView();
      this.picker.$on("dodestroy", this.doDestroy);
      this.picker.$on("pick", (date = "", visible = false) => {
        this.userInput = null;
        this.pickerVisible = this.picker.visible = visible;
        this.emitInput(date);
        this.picker.resetView && this.picker.resetView();
      });
      this.picker.$on("select-range", (start, end, pos) => {
        if (this.refInput.length === 0) return;
        if (!pos || pos === "min") {
          this.refInput[0].setSelectionRange(start, end);
          this.refInput[0].focus();
        } else if (pos === "max") {
          this.refInput[1].setSelectionRange(start, end);
          this.refInput[1].focus();
        }
      });
    },
    parseValue(value) {
      const isParsed =
        isDateObject(value) ||
        (Array.isArray(value) && value.every(isDateObject));
      if (this.valueFormat && !isParsed) {
        return (
          parseAsFormatAndType(
            value,
            this.valueFormat,
            this.type,
            this.rangeSeparator
          ) || value
        );
      }
      return value;
    },

    formatToValue(date) {
      const isFormattable =
        isDateObject(date) || (Array.isArray(date) && date.every(isDateObject));
      if (this.valueFormat && isFormattable) {
        return formatAsFormatAndType(
          date,
          this.valueFormat,
          this.type,
          this.rangeSeparator
        );
      }
      return date;
    },
    handleFocus() {
      const { type } = this;

      if (HAVE_TRIGGER_TYPES.indexOf(type) !== -1 && !this.pickerVisible) {
        this.pickerVisible = true;
      }
      this.$emit("focus", this);
    }
  }
};
