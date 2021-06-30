/**
Copyright (C) Eruvaka Technologies Pvt Ltd - All Rights Reserved * Unauthorized copying of this file, via any medium is strictly prohibited * Proprietary and confidential * 2021
**/
/**
File Name: dateUtils.js
Description: Contains stateless helper functions used in relation to date
*/
import {
  add,
  parse,
  parseISO,
  format as formatDate,
  toDate,
  setYear,
  startOfDay,
  startOfWeek,
  startOfHour,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  sub,
  set,
  min,
  isValid,
  isWithinInterval,
  compareAsc,
  compareDesc,
  differenceInDays,
  differenceInWeeks,
  differenceInHours,
  differenceInMinutes,
  isBefore,
  isEqual,
  isAfter,
  isToday,
  isSameDay,
  isSameISOWeek,
  isSameMonth,
  getHours,
  getMinutes,
  getMilliseconds,
  getUnixTime,
  getTime,
  getDate,
  getMonth,
  getYear,
  intervalToDuration
} from "date-fns";
import {
  utcToZonedTime,
  zonedTimeToUtc,
  format as formatTZ
} from "date-fns-tz";
import { enUS, es } from "date-fns/locale";
import i18n from "@/plugins/i18n";
const localesMap = {
  en: enUS,
  es
};
export const minTime = new Date(1);
export const minTimeISO = minTime.toISOString();
export const isoFormatString = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
const functionToDefaults = {
  getDateRangeFromRefDate: {
    defaultActionsOnRefDate: [
      { action: "utcToZonedTime", checkForParams: params => params.timeZone },
      { action: "startOfDay" }
    ],
    defaultActionsOnDateRangeItem: [
      {
        action: "formatTZ",
        params: ["yyyy-MM-dd"],
        checkForParams: params => params.timeZone,
        fallBackObj: {
          action: "formatDate",
          params: ["yyyy-MM-dd"]
        }
      }
    ],
    defaultActionOnDateRange: [{ action: "sort", params: [(a, b) => a - b] }]
  },
  queryInDateRange: {
    defaultActionsOnDateRangeItem: [],
    defaultActionsOnDate: [{ action: "startOfDay" }]
  },
  castISOStartOfCultureToDate: {
    defaultActionsOnSOC: [
      { action: "parseISO" },
      { action: "utcToZonedTime", checkForParams: params => params.timeZone }
    ]
  }
};
export const dateActionsDefaultItem = function(action) {
  switch (action) {
    case "formatDate":
      return (format, options) => ({
        action: "formatDate",
        params: [format, options]
      });
    case "formatTZ":
      return (format, options, fallBackFormat, fallBackOptions) => ({
        action: "formatTZ",
        params: [format, options],
        checkForParams: params => params.timeZone,
        fallBackObj: {
          action: "formatDate",
          params: [fallBackFormat, fallBackOptions]
        }
      });
    default:
      throw {
        message: "Action item not registered"
      };
  }
};
export const dateActionsMap = function(value, actionItem, params) {
  const isTimeZoneRequiredAction = [
    "utcToZonedTime",
    "zonedTimeToUtc",
    "formatTZ"
  ].includes(actionItem.action);
  const checkForParams = isTimeZoneRequiredAction
    ? params => params.timeZone
    : actionItem.checkForParams || (() => true);
  if (!checkForParams(params)) {
    if (actionItem.fallBackObj) {
      return dateActionsMap(value, actionItem.fallBackObj, params);
    } else {
      throw {
        message: `missing required actionItem.params for ${actionItem.action} (or) provide actionItem.fallBackObj`
      };
    }
  }
  switch (actionItem.action) {
    case "parse":
      return parse(value, ...actionItem.params);
    case "parseISO":
      return parseISO(value);
    case "utcToZonedTime":
      return utcToZonedTime(value, params.timeZone, actionItem.options);
    case "zonedTimeToUtc":
      return zonedTimeToUtc(value, params.timeZone, actionItem.options);
    case "startOfDay":
      return startOfDay(value);
    case "formatDate":
      return formatDate(value, ...actionItem.params);
    case "formatTZ":
      return formatTZ(value, ...actionItem.params, {
        timeZone: params.timeZone,
        ...actionItem.options
      });
    case "subtract":
      return sub(value, ...actionItem.params);
    case "add":
      return add(value, ...actionItem.params);
    case "castUserUTCToBrowserTZDate":
      return castUserUTCToBrowserTZDate(value, {
        ...actionItem.params,
        timeZone: params.timeZone,
        options: actionItem.options
      });
    case "castBrowserDateToUTC":
      return castBrowserDateToUTC(value, params.timeZoneOffset);
    default:
      throw {
        message: "Action item not registered"
      };
  }
};
export const dateRangeActionMap = function(value, item) {
  switch (item.action) {
    case "sort":
      return value.sort(...item.params);
  }
};
export const getDateRangeFromRefDate = params => {
  const defaults = functionToDefaults.getDateRangeFromRefDate;
  const {
    referenceDate,
    distanceFromRefDate,
    actionsOnReferenceDate = defaults.defaultActionsOnRefDate,
    actionsOnDateRangeItem = defaults.defaultActionsOnDateRangeItem,
    actionsOnDateRange = defaults.defaultActionOnDateRange
  } = params;
  let date = referenceDate;
  let endDate = referenceDate;
  date = actionsOnReferenceDate.reduce((acc, item) => {
    return dateActionsMap(acc, item, params);
  }, toDate(date));
  if (distanceFromRefDate) {
    endDate = distanceFromRefDate.reduce((acc, item) => {
      return dateActionsMap(acc, item, params);
    }, toDate(date));
  }
  let dateRange = [date, endDate];
  dateRange = actionsOnDateRange.reduce((acc, item) => {
    return dateRangeActionMap(acc, item, params);
  }, dateRange);
  dateRange = dateRange.map(fDate => {
    return actionsOnDateRangeItem.reduce((acc, item) => {
      return dateActionsMap(acc, item, params);
    }, toDate(fDate));
  });
  return dateRange;
};
export const queryInDateRange = params => {
  const defaults = functionToDefaults.queryInDateRange;
  const {
    dateRange,
    date,
    actionsOnDate = defaults.defaultActionsOnDate,
    actionsOnDateRangeItem = defaults.defaultActionsOnDateRangeItem
  } = params;
  let pDateRange = dateRange.map(fDate => {
    return actionsOnDateRangeItem.reduce((acc, item) => {
      return dateActionsMap(acc, item, params);
    }, fDate);
  });
  if (Array.isArray(pDateRange)) {
    pDateRange = {
      start: pDateRange[0],
      end: pDateRange[1]
    };
  }
  const pDate = actionsOnDate.reduce((acc, item) => {
    return dateActionsMap(acc, item, params);
  }, toDate(date));
  return isWithinInterval(pDate, pDateRange);
};
export const castUserUTCToBrowserTZDate = function(userUTCISO, params) {
  const { timeZone } = params;
  if (!timeZone) {
    throw {
      message: "timeZone is required"
    };
  }
  const actualUTCString = formatUserUTCISOToUTCISO(userUTCISO, timeZone);
  const browerTZdateObj = parseISO(actualUTCString);
  return browerTZdateObj;
};
export const castBrowserDateToUserUTC = function(browserDateObj) {
  return zonedTimeToUtc(browserDateObj, "UTC");
};
export const getFormatByTimeZoneOnUTC = function(
  utcISO,
  format,
  timeZone,
  options
) {
  const utcDate = parseISO(utcISO);
  const tzDate = utcToZonedTime(utcDate, timeZone);
  let { locale } = options || { locale: "en-US" };
  locale = localesMap[locale];
  return formatTZ(tzDate, format, {
    timeZone: timeZone,
    locale
  });
};
export const toISOString = function(dateObj) {
  return dateObj.toISOString();
};
export const castBrowserDateToUTC = function(value, timeZone, timeZoneOffset) {
  const browserTimeZone = new Date().getTimezoneOffset();
  if (browserTimeZone === timeZoneOffset) {
    return zonedTimeToUtc(value, timeZone);
  }
  return utcToZonedTime(zonedTimeToUtc(value, "UTC"), timeZone);
};
export const castISOToGivenTZDate = function(utcISOString, timeZone) {
  return utcToZonedTime(parseISO(utcISOString), timeZone);
};
export const dateComparator = function(a, b, castToDate) {
  let castA = a;
  let castB = b;
  if (castToDate) {
    castA = new Date(a);
    castB = new Date(b);
  }
  if (isValid(castA)) {
    return isValid(castB) ? castA - castB : -1;
  } else {
    return isValid(castB) ? 1 : 0;
  }
};
export const getBrowserTimeZoneObj = function() {
  const name = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = new Date().getTimezoneOffset();
  return {
    name,
    offset
  };
};
export const compareTZToBrowserTZ = function(timeZoneOffset) {
  const browserOffset = getBrowserTimeZoneObj().offset;
  const diff = timeZoneOffset - browserOffset;
  return diff > 0 ? 1 : diff < 0 ? -1 : 0;
};
export const getCurrDate = function() {
  return new Date();
};
export const getCurrDateInGivenTZ = function(timeZone) {
  return utcToZonedTime(getCurrDate(), timeZone);
};
export const getCurrDateMSInGivenTZ = function(timeZone) {
  return utcToZonedTime(getCurrDate(), timeZone).getTime();
};
export const getCurrTimeSecsInGivenTZ = function(timeZone) {
  const date = utcToZonedTime(getCurrDate(), timeZone);
  const hours = getHours(date);
  const mins = getMinutes(date);

  return hours * 3600 + mins * 60;
};
export const formatTZWithLocale = function(date, format, timeZone, localeStr) {
  return formatTZ(date, format, {
    timeZone,
    locale: localesMap[localeStr]
  });
};
export const formatTZToISO = function(date, timeZone) {
  return zonedTimeToUtc(date, timeZone).toISOString();
};
export const formatUTCISOToUserUTCISO = function(date, timeZone) {
  return formatTZ(
    utcToZonedTime(date, timeZone),
    "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    { timeZone }
  );
};
export const formatUserUTCISOToUTCISO = function(date, timeZone) {
  const partIso = formatTZ(
    utcToZonedTime(date, "UTC"),
    "yyyy-MM-dd'T'HH:mm:ss.SSS",
    { timeZone: "UTC" }
  );
  return (
    partIso + formatTZ(utcToZonedTime(date, timeZone), "XXX", { timeZone })
  );
};
export const getDatePickerShortcut = function(
  no,
  unit,
  customText,
  fromCurrent = true,
  dateQueryType = "PAST",
  doRound = false
) {
  const dateQueryTypeMap = {
    PAST: "Comn_last",
    FUTURE: "Comn_next"
  };
  return {
    no,
    unit,
    text:
      customText ||
      `${i18n.t(dateQueryTypeMap[dateQueryType])} ${no} ${i18n.tc(unit, no)}`,
    fromCurrent,
    dateQueryType,
    doRound
  };
};
export default {
  add,
  set,
  castBrowserDateToUserUTC,
  castBrowserDateToUTC,
  castISOToGivenTZDate,
  castUserUTCToBrowserTZDate,
  compareAsc,
  compareDesc,
  dateActionsDefaultItem,
  dateActionsMap,
  dateComparator,
  differenceInDays,
  differenceInWeeks,
  differenceInHours,
  differenceInMinutes,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  formatDate,
  formatTZ,
  formatTZWithLocale,
  formatTZToISO,
  formatUTCISOToUserUTCISO,
  formatUserUTCISOToUTCISO,
  getCurrDate,
  getCurrDateInGivenTZ,
  getCurrDateMSInGivenTZ,
  getCurrTimeSecsInGivenTZ,
  getDateRangeFromRefDate,
  getFormatByTimeZoneOnUTC,
  getUnixTime,
  getHours,
  getMinutes,
  getMilliseconds,
  getTime,
  getDate,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  isEqual,
  intervalToDuration,
  isToday,
  isSameDay,
  isSameISOWeek,
  isSameMonth,
  isValid,
  localesMap,
  min,
  parse,
  parseISO,
  queryInDateRange,
  setYear,
  startOfDay,
  startOfHour,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subtract: sub,
  toDate,
  toISOString,
  utcToZonedTime,
  zonedTimeToUtc,
  minTimeISO,
  minTime,
  isoFormatString,
  getDatePickerShortcut
};
