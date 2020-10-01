# Logger.js

![](https://badgen.net/badge/version/1.2.0/blue)
[![License](https://img.shields.io/github/license/ArthurBeaulieu/Logger.js.svg)](https://github.com/ArthurBeaulieu/Logger.js/blob/master/LICENSE.md)
![](https://badgen.net/badge/documentation/written/green)
![](https://badgen.net/badge/test/passed/green)
![](https://badgen.net/badge/dependencies/none/green)

`Logger.js` is a JavaScript ES6 module that offers a unified console output across Firefox and Chromium based browsers. It handles standard errors raised for example, with `new Error()`, and is also able to handle custom errors to fit you application needs.

With ~3Ko minified, Logger.js is designed to be stable and remain as light as possible. It is meant to be used application wide to abstract this output layer into basic calls.

# Get Started

This repository was made to store documentation, test bench and source code. If you want to include this component in your project, you either need the `src/Logger.js` file if you have an assets bundler in your project, or use the `dist/Logger.min.js` to use the minified component. This minified file is compiled in ES5 JavaScript for compatibility reasons. The unminified file is, in the contrary, coded in ES6 JavaScript.

`Logger.js` can be used to only handle console output, handling either JavaScript error and custom errors. Simply use component as follows :
```javascript
/* Import the Js component */
import Logger from 'src/Logger.js';
/* Create an event handler with no arguments for JavaScript errors only */
const appLogger = new Logger();
/* ...Or, if you want have custom errors for your app */
const appLogger = new Logger({
  errors: {
    "MY_ERROR": {
      "severity": "error",
      "title": "Title",
      "message": "Message"
    }/* ... */
  }
});
```

The Logger is now ready to raise errors :

```Javascript
/* Raise standard JavaScript errors */
appLogger.raise(new Error('Unicorn error'));
/* Raise custom error sent in constructor by its key */
appLogger.raise("MY_ERROR");
```

# Advanced usage

This component is also made to work with a notification handler, to have a single point of entry for both console error and UI output. Especially with [Notification.js](https://github.com/ArthurBeaulieu/Notification.js) that is able to work out of the box, but any notification handler that offers a `new()` method with `type`, `title` and `message` arguments will do the trick (see documentation for further details). Here is how to provide such notification handler :

```javascript
/* Import the Js components */
import Notification from 'my/notification/handler.js';
import Logger from 'src/Logger.js';
/* Just send the notification handler to the constructor */
const appLogger = new Logger({
  notification: Notification
});
/* Notification handler must implement the following method */
Notification.new = options => {
  // string : options.type
  // string : options.title
  // string : options.message
}
```

You're now good to go! If however you need more information, you can read the online [documentation](https://arthurbeaulieu.github.io/Logger.js/doc/).

# Development

If you clone this repository, you can `npm install` to install development dependencies. This will allow you to build dist file, run the component tests or generate the documentation ;

- `npm run build` to generate the minified file ;
- `npm run dev` to watch for any change in source code ;
- `npm run web-server` to launch a local development server ;
- `npm run doc` to generate documentation ;
- `npm run test` to perform all tests at once ;
- `npm run testdev` to keep browsers open to debug tests ;
- `npm run beforecommit` to perform tests, generate doc and bundle the JavaScript.

To avoid CORS when locally loading the example HTML file, run the web server. Please do not use it on a production environment. Unit tests are performed on both Firefox and Chrome ; ensure you have both installed before running tests, otherwise they might fail.

If you have any question or idea, feel free to DM or open an issue (or even a PR, who knows) ! I'll be glad to answer your request.
