"use strict";

window.exports = window.exports || {};
 
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UrlScroll =
/*#__PURE__*/
function () {
  function UrlScroll() {
    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$rootNode = _ref.rootNode,
        rootNode = _ref$rootNode === void 0 ? document : _ref$rootNode,
        _ref$attribute = _ref.attribute,
        attribute = _ref$attribute === void 0 ? 'id' : _ref$attribute,
        _ref$throttleDelay = _ref.throttleDelay,
        throttleDelay = _ref$throttleDelay === void 0 ? 20 : _ref$throttleDelay,
        _ref$debug = _ref.debug,
        debug = _ref$debug === void 0 ? false : _ref$debug;

    _classCallCheck(this, UrlScroll);

    // Установка переменных
    this.attribute = attribute; // Аттрибут блока для поиска путей

    this.throttleDelay = throttleDelay; // Задержка вызова события прокрутки

    this.debug = debug; // Отображение лога

    this.disabledScrollEvent = false;
    this.rootNode = rootNode instanceof Node ? rootNode : document.querySelector(rootNode); // Выборка DOM узла, если получен селектор

    this.console = this.consoleMethods(); // Прокси для консольных методов (Сообщения выводятся только при debug = true)

    window.addEventListener('popstate', this.routingHandler.bind(this)); // Событие перемещения по истории (Назад, Вперед)

    if (document.readyState === 'complete') this.init(); // Если страница уже загружена (При динамическом импорте)
    else window.addEventListener('load', this.init.bind(this)); // Если страница загружется, ждем события onload
  }

  _createClass(UrlScroll, [{
    key: "init",
    value: function init() {
      this.sectionsList = this.rootNode.querySelectorAll("[".concat(this.attribute, "]")); // Кэшируем список блоков, участвующих в смене URL

      this.rootNode.addEventListener('scroll', UrlScroll.debounce(this.scrollEventHandler.bind(this), this.throttleDelay)); // Событие прокрутки страницы

      this.routingHandler(); // Запуск маршрутизации
    }
  }, {
    key: "scrollEventHandler",
    value: function scrollEventHandler() {
      var _this = this;

      if (this.disabledScrollEvent) return this.console.log('Scroll event skipped');
      var sectionChanged = false;
      this.sectionsList.forEach( // Перебираем список блоков
      function (section) {
        if (sectionChanged) return;
        if (!UrlScroll.isScrolledIntoView(section)) return;
        var targetSection = section.getAttribute(_this.attribute); // Получаем значение аттрибута

        if (history.state && history.state.section === '' && history.state.section === targetSection) return; // URL и значение аттрибута пустое

        if (history.state && history.state.section && history.state.section === targetSection) return; // URL и значение аттрибута идентичны

        sectionChanged = true;

        try {
          var stateData = {
            section: targetSection
          };

          _this.console.debug('PushState', stateData, targetSection);

          history.pushState({
            section: targetSection
          }, null, targetSection); // Добавляем новый шаг в историю согласно значению аттрибута

          _this.console.log("Section changed to: ".concat(targetSection));
        } catch (e) {
          _this.console.error('Необходимо повысить значение задержки троттлинга (throttleDelay)', e); // Данное ограничение присутствует в Safari

        }
      });
    }
  }, {
    key: "routingHandler",
    value: function routingHandler() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
      this.console.debug('Routing start', event);
      this.disableScrollEvent(); // Отключем событие прокрутки, чтобы не создавались лишние шаги в истории

      var currentState = event && event.state ? event.state : history.state;
      var targetSection = currentState && currentState.section ? currentState.section : location.pathname; // Целевой путь

      var targetSectionNode = this.rootNode.querySelector("[".concat(this.attribute, "=\"").concat(targetSection, "\"]")); // Блок ассоциированный с целевым путем

      if (!targetSectionNode) return setTimeout(function () {
        return document.body.scrollTo(0, 0);
      }, 1); // Если блок не найден, возвращаемся в начало страницы

      setTimeout(function () {
        return targetSectionNode.scrollIntoView();
      }, 1); // Прокручиваем страницу к целевому блоку, используя отдельный поток

      this.console.debug("Scrolled to ".concat(targetSection), targetSectionNode);
      return true;
    }
  }, {
    key: "disableScrollEvent",
    value: function disableScrollEvent() {
      var _this2 = this;

      var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.throttleDelay * 2;
      // Отключие события прокрутки
      this.disabledScrollEvent = true;
      this.console.log('Scroll Event disabled');
      setTimeout(function () {
        _this2.disabledScrollEvent = false;

        _this2.console.log('Scroll Event enabled');
      }, timeout);
    }
  }, {
    key: "consoleMethods",
    value: function consoleMethods() {
      var _this3 = this;

      // Прокси для консольных методов (Сообщения выводятся только при debug = true)
      return {
        log: function log() {
          var _console$log;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return _this3.debug ? (_console$log = console.log).call.apply(_console$log, [console].concat(args)) : null;
        },
        debug: function debug() {
          var _console$debug;

          for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            args[_key2] = arguments[_key2];
          }

          return _this3.debug ? (_console$debug = console.debug).call.apply(_console$debug, [console].concat(args)) : null;
        },
        error: function error() {
          var _console$error;

          for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
            args[_key3] = arguments[_key3];
          }

          return _this3.debug ? (_console$error = console.error).call.apply(_console$error, [console].concat(args)) : null;
        }
      };
    }
  }], [{
    key: "isScrolledIntoView",
    value: function isScrolledIntoView(elementNode) {
      // Проверка попадания блока в зону видимости
      var rect = elementNode.getBoundingClientRect();
      var elemTop = rect.top;
      var elemBottom = rect.bottom; // Алгоритм подсчета можно откорректировать под себя

      return elemTop >= 0 && elemTop <= window.innerHeight / 2; //(elemBottom <= window.innerHeight);
    }
  }, {
    key: "debounce",
    value: function debounce(func, wait) {
      // Уменьшение тактов вызова функции
      var timeout;
      return function () {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }

        var context = this;
        clearTimeout(timeout);
        timeout = setTimeout(function () {
          return func.apply(context, args);
        }, wait);
      };
    }
  }]);

  return UrlScroll;
}();

exports.default = UrlScroll;
window.UrlScroll = UrlScroll; // Legacy support
//# sourceMappingURL=urlScroll.js.map