/* eslint-disable no-unused-vars */
export enum FACILITY {
  KERNEL = 0, // kernel messages
  USER = 1, // user space messages
  MAIL = 2, // mail system messages
  SYSTEM_DAEMONS = 3, // system daemon messages
  MESSAGES = 5, // messages generated internally by syslog
  LINE_PRINTER = 6, // lline printer subsystem
  NETWORK_NEWS = 7, // network news subsystem
  UUCP = 8, // UUCP sub system,
  CLOCK_DAEMON = 9, // clock daemon
  SECURITY_AUTH_MESSAGES = 10, // security/authorization messages
  FTP_DAEMON = 11, // ftp messages
  NTP_SUBSYSTEM = 12, // ntp messages
  LOG_AUDIT = 13, // audit log
  LOG_ALERT = 14,
  CLOCK_DAEMON_2 = 15, // clock daemon (note2)
  LOCAL0 = 16,
  LOCAL1 = 17,
  LOCAL2 = 18,
  LOCAL3 = 19,
  LOCAL4 = 20,
  LOCAL5 = 21,
  LOCAL6 = 22,
  LOCAL7 = 23,
}
export enum SEVERITY {
  EMERGENCY = 0, // system is unusable
  ALERT = 1, // action must be taken immediately
  CRITICAL = 2, // critical conditions
  ERROR = 3, // error conditions
  WARNING = 4, // warning conditions
  NOTICE = 5, // normal but significant
  INFORMATIONAL = 6, // informational messages
  DEBUG = 7, // debug level
}
export interface PRI {
  facility: FACILITY
  severity: SEVERITY
}
