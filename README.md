# cuculoco
Automatic End-to-End tests in Javascript  

- [Features](#features)
- [Installing](#installing)
- [Running](#running)
- [Debugging](#debugging)
- [Deploying](#deploying)
- [Project structure](#project-structure)
- [Page Objects](#page-objects)
- [The Page class](#the-page-class)

## Features
* Behaviour-Driven-Development using [Cucumber.js](https://github.com/cucumber/cucumber-js)
* UI tests using [Selenium](https://www.selenium.dev/selenium/docs/api/javascript/)
* HTML report for tests result (see [Reports](#reports))

## Installing
You need to have [Node.js](https://nodejs.org/en/) (version 12 or above) installed first.
```
$ git clone https://github.com/Ohadvc/cuculoco.git
$ npm install 
```

## Running
Run all  feature files in folder
```
$ node index ./features/example
```
Same as the above but filter by @selected tag
```
$ node index --tags=@wiki ./features/example
```
Run specific scenario 
```
$ node index ./features/example/wiki.feature:5
```

## Debugging
Using a debugger can be done by passing the debug option:
```
$ node --inspect-brk index ./features/example
```
This will start a debugger session, break on the first line and wait for a debugger client to connect.   
In order to use Chrome as the debugger client use [chrome://inspect](chrome://inspect)  
Adding a breakpoint in the code can be done using _debugger_ keyword  

See also [Node.js guide to debugging](https://nodejs.org/en/docs/inspector/)

## Deploying
_master_ branch is protected by the following automatic tests:
* Gherkin syntax validation
* Static code analysis using [ESLint](https://eslint.org/)

You can run the tests yourself using:
```
$ npm run gherkin-validation
```
and
```
$ npx eslint .
```

You can configure **RubyMine** to validate your code will pass the tests using the following:
* Install cucumber.js plugin
* Enabling ESLint (via the RubyMine->Preferences...) and choosing 'Automatic ESLint configuration'. 
This way it will use the same _.eslintrc.js_ file as the automatic tests.

## Project structure
| Name | Description|
|------|------------|
|:file_folder: features|Cucumber feature files|
|:file_folder: steps|Steps js files|
|:file_folder: pages|Page-objects js files|
|:file_folder: reports|JSON & HTML reports of tests results (see [Reports](#reports))|  
|:file_folder: runtime|runtime logic js files|
|Dockerfile| Allow running project in docker (used by the Jenkinsfile)|
|Jenkinsfile| Allow running project in Jenkins|
   

## Page Objects
A page object encapsulates the behavior of a specific UI page.  
Each page object should extend 'Page' and include the following:

|  | Description|
|------|------------|
|url|an attribute used by `Page.goto()` to navigate to the page|
|title|an attribute used by `Page.goto()`. It waits until the browser's title changes to 'title'|
|elements|an attribute of type hash containing all UI elements locators. The best practice is to have all UI related stuff (HTML locators) here|
|methods|implement the page behaviour|

Example:
```javascript
class MainWiki extends Page {
  constructor() {
    super();
    this.pageParams = {
      url: `https://www.wikipedia.org/`,
      title: 'Wikipedia'
  };
    this.elements = {
      searchContainer: By.css('.search-container'),
      searchInput: By.css('.search-input input[name="search"]'),
      searchResultsDropdown: By.css('.suggestions-dropdown'),
      searchResultsOption: By.css('.suggestion-link'),
      resultTitle: By.css('.suggestion-link .suggestion-title'),
    };
  }

  async goto() {
    return await super.goto(this.pageParams);
  }
  async searchValue(name) {
    const searchContainer = await this.getElement(this.elements.searchContainer);
    await this.enterText(this.elements.searchInput, name, searchContainer);
    await this.getElement(this.elements.searchResultsDropdown);
  }

  async getSearchResults() {
    const results = await this.getElements(this.elements.searchResultsOption);
    if (results.length === 0)
      throw (`no results found`);
    return await this.getElementsText(this.elements.resultTitle);
  }
}
```
### The Page class
Page class includes utility methods that makes it easier to interact with our UI pages.  
In general all methods waits for the relevant element to be available on the page.
  
[Here's the jsdoc](readme/page.md)
