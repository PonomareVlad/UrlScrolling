export default class UrlScroll {

    constructor({rootNode = document, attribute = 'id', headerSection = true, throttleDelay = 20, debug = false} = {}) {
        // Установка переменных
        this.attribute = attribute; // Аттрибут блока для поиска путей
        this.throttleDelay = throttleDelay; // Задержка вызова события прокрутки
        this.debug = debug; // Отображение лога
        this.headerSection = headerSection; // Обработка перехода в шапку сайта, как шаг в истории
        this.disabledScrollEvent = false;
        this.rootNode = rootNode instanceof Node ? rootNode : document.querySelector(rootNode); // Выборка DOM узла, если получен селектор
        this.console = this.consoleMethods(); // Прокси для консольных методов (Сообщения выводятся только при debug = true)
        window.addEventListener('popstate', this.routingHandler.bind(this)); // Событие перемещения по истории (Назад, Вперед)
        if (document.readyState === 'complete') this.init(); // Если страница уже загружена (При динамическом импорте)
        else window.addEventListener('load', this.init.bind(this)); // Если страница загружется, ждем события onload
    }

    init() {
        this.sectionsList = this.rootNode.querySelectorAll(`[${this.attribute}]`); // Кэшируем список блоков, участвующих в смене URL
        this.rootNode.addEventListener('scroll', UrlScroll.debounce(this.scrollEventHandler.bind(this), this.throttleDelay)); // Событие прокрутки страницы
        this.routingHandler(); // Запуск маршрутизации
    }

    scrollEventHandler() {
        if (this.disabledScrollEvent) return this.console.log('Scroll event skipped');
        let sectionChanged = false;
        this.sectionsList.forEach( // Перебираем список блоков
            section => {
                if (sectionChanged) return;
                if (!UrlScroll.isScrolledIntoView(section)) return; // Проверка попадания блока в зону видимости
                sectionChanged = true;
                let targetSection = section.getAttribute(this.attribute); // Получаем значение аттрибута
                if (history.state && history.state.section === '' && history.state.section === targetSection) return; // URL и значение аттрибута пустое
                if (history.state && history.state.section && history.state.section === targetSection) return; // URL и значение аттрибута идентичны
                try {
                    let stateData = {section: targetSection};
                    this.console.debug('PushState', stateData, targetSection);
                    history.pushState({section: targetSection}, null, targetSection); // Добавляем новый шаг в историю согласно значению аттрибута
                    this.console.log(`Section changed to: ${targetSection}`)
                } catch (e) {
                    this.console.error('Необходимо повысить значение задержки троттлинга (throttleDelay)', e) // Данное ограничение присутствует в Safari
                }
            }
        );
        if (this.headerSection && !sectionChanged) if (history.state && history.state.section) { // Переход на первый экран страницы, в случае если над первой секцией есть меню или контент
            history.pushState({section: false}, null, '/');
            this.console.log('Changed to Header');
        }
    }

    routingHandler(event = null) {
        this.console.debug('Routing start', event);
        this.disableScrollEvent(); // Отключем событие прокрутки, чтобы не создавались лишние шаги в истории
        let currentState = event && event.state ? event.state : history.state;
        let targetSection = currentState && currentState.section ? currentState.section : location.pathname; // Целевой путь
        let targetSectionNode = this.rootNode.querySelector(`[${this.attribute}="${targetSection}"]`); // Блок ассоциированный с целевым путем
        if (!targetSectionNode) return setTimeout(() => document.body.scrollTo(0, 0), 1); // Если блок не найден, возвращаемся в начало страницы
        setTimeout(() => targetSectionNode.scrollIntoView(), 1); // Прокручиваем страницу к целевому блоку, используя отдельный поток
        this.console.debug(`Scrolled to ${targetSection}`, targetSectionNode);
        return true;
    }

    disableScrollEvent(timeout = this.throttleDelay * 2) { // Отключие события прокрутки
        this.disabledScrollEvent = true;
        this.console.log('Scroll Event disabled');
        setTimeout(() => {
            this.disabledScrollEvent = false;
            this.console.log('Scroll Event enabled')
        }, timeout);
    }

    consoleMethods() { // Прокси для консольных методов (Сообщения выводятся только при debug = true)
        return {
            log: (...args) => this.debug ? console.log.call(console, ...args) : null,
            debug: (...args) => this.debug ? console.debug.call(console, ...args) : null,
            error: (...args) => this.debug ? console.error.call(console, ...args) : null,
        }
    }

    static isScrolledIntoView(elementNode) { // Проверка попадания блока в зону видимости
        let rect = elementNode.getBoundingClientRect();
        let elemTop = rect.top;
        let elemBottom = rect.bottom;
        let halfWindowHeight = parseInt(window.innerHeight / 2);
        return (elemTop <= halfWindowHeight + 1 && elemBottom >= halfWindowHeight - 1); // Алгоритм подсчета можно откорректировать под себя
    }

    static debounce(func, wait) { // Уменьшение тактов вызова функции
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait)
        }
    }
}

window.UrlScroll = UrlScroll; // Legacy support