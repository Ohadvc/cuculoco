const {context} = require('../runtime/context');
const {By, until, Key} = require('selenium-webdriver');
const {browser} = require('../runtime/browser');

class Page {
    /**
     * Create new Page
     * @param root - optional root element for the page
     */
    constructor(root = browser()) {
        this.root = root;

        this.page_elements =  {
            radioButton: By.css('md-radio-button'),
            selectListItem: By.css('div.md-select-menu-container.md-active md-option, div.md-select-menu-container.md-active md-option div, div.md-select-menu-container.md-active md-option div.md-text div, div.v-select-list div.v-list-item'),
        }
    }

    /**
     * Navigate to the page url if defined. Find the page root element if defined
     * @param root_locator - if specified set page root element according to this locator (useful for dialogs for example)
     * @param url - if specified navigation is done by using this url
     * @param title - if specified wait for this title after navigation
     * @param locator - if specified wait for this element after navigation
     */
    async goto({url, title, locator} = {}) {
        const currentUrl = await browser().getCurrentUrl();
        if (currentUrl !== url)
            await browser().get(url);

        title &&  await this.wait(until.titleContains(title), `Title is not ${title} for page ${this.constructor.name}`);
        locator && await this.wait(until.elementLocated(locator), `Can't find ${locator} element in page ${this.constructor.name}`);
        !title && !locator && await this.wait(until.elementLocated(By.css('body')), `Can't find body in page ${this.constructor.name}`);
        return this;
    }

    async getPageTitle() {
    return await browser().getTitle();
    }


    /**
     * Get the current url
     * @returns url
     */
    async getCurrentUrl() {
        await this._waitForValidURL();
        return await browser().getCurrentUrl();
    }

    async _waitForValidURL() {
        await this.wait(async () => (await browser().getCurrentUrl() !== "about:blank"), `URL didn't changed from "about:blank"`);
    }

    /**
     * Wait for url to change from current_url
     * @param current_url
     * @returns new url
     */
    async urlChanged(current_url) {
        return await this.wait(async () => {
            return await browser().getCurrentUrl() !== current_url;
        }, `URL didn't changed from ${current_url}`);
    }


    /**
     * Get element by locator
     * @param locator
     * @param root - optional
     * @param timeoutOverride - optional
     * @returns {Promise<WebElement>} the element
     */
    async getElement(locator, root = this.root, timeoutOverride) {
        return await this.wait(() => this._getElement(root, locator),
          `Can't find element '${this.locatorToName(locator)}' on page '${this.constructor.name}'`, timeoutOverride);
    }

    async _getElement(root, locator) {
        try {
            const element =  await root.findElement(locator);
            return await element.isDisplayed() ? element : null
        } catch (e) {
            return null
        }
    }


    /**
     * Get elements by locator
     * @param locator
     * @param root - optional
     * @returns {array} containing the elements
     */
    async getElements(locator, root = this.root) {
        return await this.wait(() => this._getElements(root, locator),
          `Can't find elements '${this.locatorToName(locator)}' on page '${this.constructor.name}'`);
    }

    async _getElements(root, locator) {
        try {
            return await root.findElements(locator)
        } catch (e) {
            return null
        }
    }


    /**
     * Get elements text by locator
     * @param locator
     * @param root - optional
     * @returns {array} containing text of each element
     */
    async getElementsText(locator, root = this.root) {
        let result = [];
        const elements = await this._getElements(root, locator);
        for (const element of elements)
            result.push(await element.getText());

        return result
    }


    /**
     * Click element by locator
     * @param locator
     * @param root - optional
     */
    async clickOnLocator(locator, root = this.root) {
        const element = await this.getElement(locator, root);
        return await this.clickWebElement(element);
    }

    /**
     * Click webdrive element
     * @param element
     */
    async clickWebElement(element) {
        return await this.wait(() => this._clickWebElement(element),
          `Can't click element on page '${this.constructor.name}'`);
    }

    async _clickWebElement(element) {
        await this.sleep(500);
        try {
            await element.click();
            return element;
        } catch {
            return null;
        }
    }



    async _findInElements(locator, condition, root = this.root) {
        const elems = await this.getElements(locator, root);
        for (const e of elems) {
            if (await condition(e))
                return e
        }
        return null
    }

    /**
     * Find in elements by condition
     * @param locator
     * @param condition
     * @param root - optional
     * @param timeoutOverride - optional
     * @returns {element} the first matching element
     */
    async findInElements(locator, condition, root = this.root, timeoutOverride) {
        return await this.wait(() => this._findInElements(locator, condition, root),
          `Can't find element in elements '${this.locatorToName(locator)}' that matches the condition on page '${this.constructor.name}'`,
          timeoutOverride)
    }

    /**
     * Find in elements by text
     * @param locator
     * @param text
     * @param root - optional
     * @returns {element} the first matching element
     */
    async findInElementsByText(locator, text, root = this.root) {
        return await this.findInElements(locator, async (e) => {
            return ((await e.getText()).trim() === text)
        }, root)
    }



    /**
     * Choose menu option by locator (text by default, otehrwise - selector)
     * @param menu_locator
     * @param option - can be a text of the option name (string), or it's locator (object)
     * @param menu_root - optional
     * @param option_root - optional locator (generic defaults in page, non generic can be added from call)
     */
    async chooseSelectListOption(menu_locator, option, menu_root = this.root, option_root = this.page_elements.selectListItem) {
        await this.clickOnLocator(menu_locator, menu_root);

        if (typeof option === 'string') {
            await this.clickWebElement(await this.findInElementsByText(option_root, option));
        } else if (typeof option === 'object') {
            await this.clickOnLocator(option);
        }
    }

    /**
     * Choose radio button option by text
     * @param radio_locator
     * @param option_text
     * @param root - optional
     */
    async chooseRadioButtonOption(radio_locator, option_text, root = this.root) {
        const radio = await this.getElement(radio_locator, root)
        await (await this.findInElementsByText(this.page_elements.radioButton, option_text, radio)).click()
    }


    /**
     * enterText to element by locator and verify text validity
     * @param locator
     * @param text
     * @param root - optional
     * @param timeoutOverride - optional
     */
    async enterText(locator, text, root = this.root, timeoutOverride) {
        await this.wait(() => this._enterText({locator, text, root, timeoutOverride}),
          `Couldn't enterText '${text}' to element '${this.locatorToName(locator)}' on page '${this.constructor.name}'`, timeoutOverride);
    }

    async _enterText({locator, text, root, timeoutOverride}) {
        let element = await this.getElement(locator, root, timeoutOverride);
        await this._clearInput(element, text);
        await this._inputText(element, text);
        return this._validateTextInput(element, text);
    }

    async _clearInput(element, text) {
        try {
            await element.clear();
            if (await element.getAttribute('value') !== "")
                await this._clearInputManually(element);
        } catch (e) {
            console.log(e);
            return await this._hardClearInput(element, text);
        }
        return true;
    }

    /**
     * Vue js inputs don't support the traditional element.clear() method provided by selenium.
     */
    async _clearInputManually(element) {
        await this.wait(async () => {
            await element.sendKeys(Key.BACK_SPACE);
            return (await element.getAttribute('value') === "");
        });
    }

    /**
     * In case Text field is updated dynamically (to format input\search input), nd element becomes ElementNotInteractableError -> actions.sendKeys
     */
    async _hardClearInput(element, text) {
        for (let i = 0; i < text.length; i++) {
            const actions = await browser().actions({bridge: true});
            await actions.sendKeys(Key.BACK_SPACE).perform();
        }
    }

    async _inputText(element, text) {
        try {
            await element.sendKeys(text);
        } catch (e) {
            const actions = await browser().actions({bridge: true});
            await actions.sendKeys(text).perform();
        }
    }

    /**
     * workaround for Angular issue in which the text may be entered truncated (see https://github.com/angular/protractor/issues/3196)
     * sleep added to dynamicInputField that "blinks" in and out - ElementNotInteractableError:
     */
    async _validateTextInput(element, textToVerify) {
        try {
            const textInField = await element.getAttribute('value');
            if (textInField.toString() !== textToVerify)
                return null;
        } catch (e) {
            console.log(e);
            return null;
        }
        return true;
    }









    /**
     * Wait on condition
     */
    async wait(condition, message, timeout = context.operation_timeout) {
        return await browser().wait(condition, timeout, message);
    }

    locatorToName(locator) {
        return this._getKeyByValue(this.elements, locator) ||
          this._getKeyByValue(this.page_elements, locator) ||
          locator;
    }

    _getKeyByValue(obj, value) {
        for (const key in obj) {
            if (obj[key] === value)
                return key;
            if (typeof obj[key] == "object" && !(obj[key] instanceof By)) {
                const res = this._getKeyByValue(obj[key], value);
                if (res) return res;
            }
        }
        return null;
    }

    /**
     * sleep to avoid miss clicks and reduce flakiness
     * @returns {Promise<*>}
     */
    async sleep(timeout = 1000) {
        return await browser().sleep(timeout);
    }



}

module.exports = Page;
