'use strict';


class Logger {


  /** @summary <h1>JavaScript logger singleton to handle errors the same way</h1>
   * @author Arthur Beaulieu
   * @since June 2020
   * @description <blockquote>The Logger class provides a singleton object to allow braindead logging for frontend
   * JavaScript code. Errors can be raised from JavaScript errors (<code>new Error()</code>), or using a custom error
   * format, with a severity, title and message. It is also possible to pass a notification manager object to handle
   * those error either in console and in UI. The recommended manager to use for notification can be found at
   * <a href="https://github.com/ArthurBeaulieu/Notification.js" alt="notififcation-js">
   * https://github.com/ArthurBeaulieu/Notification.js</a>. You can otherwise implement you system, but it as to take
   * a type (severity), a title and a message ; for further information, refer to the <code>_logErrorToNotification</code>
   * documentation. For source code, please go to <a href="https://github.com/ArthurBeaulieu/Logger.js" alt="logger-js">
   * https://github.com/ArthurBeaulieu/Logger.js</a></blockquote>
   * @param {object} [options={}] - The Logger object, not mandatory but it is recommended to provide one for full features
   * @param {object} [options.errors={}] - The custom errors, JSON style, with key being the error name and value being
   * an object with a <code>severity</code>, a <code>title</code> and a <code>message</code> property (all strings)
   * @param {object} [options.notification=null] - The notification manager (to create new notifications when logging)
   * @param {boolean} [options.log=true] - Allow console logging (turn to false in prod environement)
   * @retun {object} - The Logger singleton instance */
  constructor(options = {}) {
    // If an instance of Logger already exists, we just return it
    if (!!Logger.instance) {
      return Logger.instance;
    }
    // Set object instance
    Logger.instance = this;
    // Prevent wrong type for arguments
    if (typeof options.errors !== 'object') { options.errors = {}; }
    if (typeof options.notification !== 'object') { options.notification = null; }
    if (typeof options.log !== 'boolean') { options.log = true; }
    /** @private
     * @member {object} - The error messages to use in Logger */
    this._errors = options.errors;
    /** @private
     * @member {object} - The custom notification handler, must be able to take type, title and message (at least) */
    this._notification = options.notification;    
    /** @private
     * @member {boolean} - Internal logging flag from constructor options, allow to output each event action */
    this._log = options.log;
    /** @public
     * @member {string} - Component version */
    this.version = '0.0.1';    
    return this;
  }


  destroy() {
    // Delete object attributes
    Object.keys(this).forEach(key => { delete this[key]; });
  }


  /*  --------------------------------------------------------------------------------------------------------------- */
  /*  ----------------------------------------  LOGGER JS INTERN METHOS  -------------------------------------------  */
  /*                                                                                                                  */
  /*  The three following methods (subscribe, unsubscribe, publish) are designed to reference an event by its name    */
  /*  and handle as many subscriptions as you want. When subscribing, you get an ID you can use to unsubscribe your   */
  /*  event later. Just publish with the event name to callback all its registered subscriptions.                     */
  /*  --------------------------------------------------------------------------------------------------------------- */  


  _buildErrorInfo(error) {
    let severity = '';
    let title = '';
    let message = '';
    // this._errors doesn't contain the error key ; either a Js error or an unknown error
    if (this._errors[error] === undefined) {
      // JavaScript error created with new Error(), that need to contain fileNmae, message, line and column number
      if (error.fileName && error.message && error.lineNumber && error.columnNumber) {
        const filename = error.fileName.match(/\/([^\/]+)\/?$/)[1];
        severity = 'error';
        title = `JavaScript error`;
        message = `${error.message} in file ${filename} (${error.lineNumber}:${error.columnNumber})`;
      } else { // Unknown error that do not require any arguments
        severity = 'error';
        title = `Unexpected error ${error}`;
        message = 'The error object sent to Logger.raise() is neither a JavaScript error nor a custom error (with severity, title and message).';
      }
    } else { // Custom error that need to be filled with a severity, a title and a message
      severity = this._errors[error].severity;
      title = this._errors[error].title;
      message = this._errors[error].message;
    }

    return {
      severity: severity,
      title: title,
      message: message
    };
  }


  _logErrorToNotification(errorParameters) {
    if (this._notification) {
      this._notification.new({
        type: errorParameters.severity,
        title: errorParameters.title,
        message: errorParameters.message
      });
    }
  }


  _logErrorToConsole(errorParameters) {
    if (this._log) {
      /* Colors to use, extracted from Notification.js (https://github.com/ArthurBeaulieu/Notification.js) */
      const colors = {
        success: 'color: rgb(76, 175, 80);',
        info: 'color: rgb(3, 169, 244);',
        warning: 'color: rgb(255, 152, 0);',
        error: 'color: rgb(244, 67, 54);'
      };    
      const browsers = {
        firefox: /firefox/i.test(navigator.userAgent),
        chrome: /chrome/i.test(navigator.userAgent) && /google inc/i.test(navigator.vendor)
      };
      // Compute log level from severity, and handle warn and log as warning and success
      let logLevel = errorParameters.severity;
      if (errorParameters.severity === 'warning') { 
        logLevel = 'warn';
      } else if (errorParameters.severity === 'success') { 
        logLevel = 'log';
      }
      // Create console group with associated style
      console.groupCollapsed(`%c${errorParameters.severity.toUpperCase()}: ${errorParameters.title}`, colors[errorParameters.severity]);
      // Apply type and severity to build console call
      const outputString = `%c${errorParameters.message}\n${this._getCallerName(browsers)}`;
      console[logLevel](outputString, colors[errorParameters.severity]);
      // Only append console trace if severity is not an error (as error already display trace)
      if (errorParameters.severity !== 'error') { console.trace(); }
      console.groupEnd();
    }
  }


  _getCallerName(browsers) {
    // Original code from: https://gist.github.com/irisli/716b6dacd3f151ce2b7e
    let caller = (new Error()).stack; // Create error and get its call stack

    if (browsers.firefox) {
      caller = caller.split('\n')[3];
      caller = caller.replace(/\@+/, ' '); // Change `@` to `(`
    } else if (browsers.chrome) {
      caller = caller.split('\n')[4];
      caller = caller.replace(/^Error\s+/, ''); // Remove Chrome `Error` string
      caller = caller.replace(/^\s+at./, ''); // Remove Chrome `at` string
    }

    return `Raised from function ${caller.charAt(0) === ' ' ? `<anonymous>${caller}`: caller}`;
  }


  /*  --------------------------------------------------------------------------------------------------------------- */
  /*  -------------------------------------------  CUSTOM JS EVENTS  -----------------------------------------------  */
  /*                                                                                                                  */
  /*  The three following methods (subscribe, unsubscribe, publish) are designed to reference an event by its name    */
  /*  and handle as many subscriptions as you want. When subscribing, you get an ID you can use to unsubscribe your   */
  /*  event later. Just publish with the event name to callback all its registered subscriptions.                     */
  /*  --------------------------------------------------------------------------------------------------------------- */


  raise(error) {  
    // Create error specific values depending on error origin (JavaScript, Custom or Unknown) */    
    const errorParameters = this._buildErrorInfo(error);
    /* If any Notification manager exists, use it with error parameters */
    this._logErrorToNotification(errorParameters)
    /* In debug mode, fill the console with error parameters */
    this._logErrorToConsole(errorParameters);    
  }


}


export default Logger;
