const Page = require('../Page');
const {By, until} = require('selenium-webdriver');

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

  async accessResult(articleName) {
    await this.clickWebElement(await this.findInElementsByText(this.elements.resultTitle, articleName));
    await this.urlChanged(this.pageParams.url);
    return await this.wait(until.titleContains(articleName));
  }

}

module.exports = MainWiki;
