import Logger from '../src/Logger.js'
'use strict';


// Working component, re-instantiated before each test
let AppLogger = null;


describe('Logger unit test', () => {


  beforeEach(() => {
    AppLogger = new Logger();
  });


  it('Component construction', done => {
    done();
  });


});
