export default class UrlScroll {

    constructor({rootNode = document, attribute = 'id', throttleDelay = 20, debug = false} = {}) {
        this.attribute = attribute;
        this.throttleDelay = throttleDelay;
        this.debug = debug;
        this.rootNode = rootNode instanceof Node ? rootNode : document.querySelector(rootNode);
        this.console = this.consoleMethods();
        this.disabledScrollEvent = false;
        window.addEventListener('popstate', this.routingHandler.bind(this));
        if (document.readyState === 'complete') this.init();
        else window.addEventListener('load', this.init.bind(this));
    }

    static isScrolledIntoView(elementNode) {
        let rect = elementNode.getBoundingClientRect();
        let elemTop = rect.top;
        let elemBottom = rect.bottom;
        return (elemTop >= 0) && (elemTop <= window.innerHeight / 2)//(elemBottom <= window.innerHeight);
    }

    static debounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait)
        }
    }

    init() {
        this.sectionsList = this.rootNode.querySelectorAll(`[${this.attribute}]`);
        this.rootNode.addEventListener('scroll', UrlScroll.debounce(this.scrollEventHandler.bind(this), this.throttleDelay));
        this.routingHandler();
    }

    scrollEventHandler() {
        if (this.disabledScrollEvent) return this.console.log('Scroll event skipped');
        let sectionChanged = false;
        this.sectionsList.forEach(
            section => {
                if (sectionChanged) return;
                if (!UrlScroll.isScrolledIntoView(section)) return;
                let targetSection = section.getAttribute(this.attribute);
                if (history.state && history.state.section === '' && history.state.section === targetSection) return;
                if (history.state && history.state.section && history.state.section === targetSection) return;
                sectionChanged = true;
                try {
                    let stateData = {section: targetSection};
                    this.console.debug('PushState', stateData, targetSection);
                    history.pushState({section: targetSection}, null, targetSection);
                    this.console.log(`Section changed to: ${targetSection}`)
                } catch (e) {
                    this.console.error('Необходимо повысить значение задержки троттлинга (throttleDelay)', e)
                }
            }
        )
    }

    routingHandler(event = null) {
        // if (event && !event.state) return true;
        // if (event) event.preventDefault();
        this.console.debug('Routing start', event);
        this.disableScrollEvent();
        let currentState = event && event.state ? event.state : history.state;
        let targetSection = currentState && currentState.section ? currentState.section : location.pathname;
        let targetSectionNode = this.rootNode.querySelector(`[${this.attribute}="${targetSection}"]`);
        if (!targetSectionNode) return setTimeout(() => document.body.scrollTo(0, 0), 1);
        // this.disabledScrollEvent = true;
        setTimeout(() => targetSectionNode.scrollIntoView(), 1);
        this.console.debug(`Scrolled to ${targetSection}`, targetSectionNode);
        // setTimeout(() => this.disabledScrollEvent = false, this.throttleDelay * 2);
        return true;
    }

    disableScrollEvent(timeout = this.throttleDelay * 2) {
        this.disabledScrollEvent = true;
        this.console.log('Scroll Event disabled');
        setTimeout(() => {
            this.disabledScrollEvent = false;
            this.console.log('Scroll Event enabled')
        }, timeout);
    }

    consoleMethods() {
        return {
            log: (...args) => this.debug ? console.log.call(console, ...args) : null,
            debug: (...args) => this.debug ? console.debug.call(console, ...args) : null,
            error: (...args) => this.debug ? console.error.call(console, ...args) : null,
        }
    }
}