/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Amphilohiy
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/*:
 * @plugindesc Allows permanently create, replace and delete events
 * @author Amphilohiy
 *
 * @param Templates
 * @desc Map id's stored templated events.
 * @default []
 * @type number[]
 *
 * @param Default id variable
 * @desc If id in command not specified tries to use value of selected variable.
 * @default 1
 * @type variable
 *
 * @param Create event command
 * @desc Command name used in events, like "Create Event bum 1 1 1 1". Case insensitive.
 * @default create event
 *
 * @param Remove event command
 * @desc Command name used in events, like "Remove Event 1 1". Case insensitive.
 * @default remove event
 *
 * @param Replace event command
 * @desc Command name used in events, like "Replace Event bum 1 1 1 1". Case insensitive.
 * @default replace event
 *
 * @help
 * Allows you to manipulate events, making permanent changes. For creating event you need to make map with events you desire to "clone", and then add map id to parameter "Templates". Now you can use template events by it's name.
 * There is two ways to manipulate events: through javascript (JS) and plugin command (PC). Both ways similar.
 *
 * JS: EventFactory.createEvent(eventName, x, y, mapId, variableId)
 * PC: create Event eventName x y mapId variableId
 * Creates event from templates by name "eventName", on coordinates x, y. If mapId not specified - creates event on current map. If variableId specified - saves id of new event to variable in specified slot.
 *
 * JS: EventFactory.removeEvent(id, mapId)
 * PC: remove Event id mapId
 * Permanently removes event with id from game. if mapId not specified - removes event on current map.
 *
 * JS: EventFactory.replaceEvent(eventName, id, x, y, mapId)
 * PC: replace Event eventName, id, x, y, mapId
 * Replaces event with specified id by event with specified name. If coordinates not specified - tries to preserve event's position. If mapId not specified - replaces event on current map.
 */

/*:ru
 * @plugindesc Позволяет перманентно создавать, заменять и удалять события
 * @author Amphilohiy
 *
 * @param Templates
 * @desc Ид карт, хранящих шаблонные события. Разделены запятыми.
 * @default []
 * @type number[]
 *
 * @param Default id variable
 * @desc Если ИД в команде не указано, то используется значение переменной.
 * @default 1
 * @type variable
 *
 * @param Create event command
 * @desc Команда используюмая в событиях, например "CreateEvent бомж 1 1 1 1". Регистронезависима.
 * @default create Event
 *
 * @param Remove event command
 * @desc Команда используюмая в событиях, например "RemoveEvent 1 1". Регистронезависима.
 * @default remove Event
 *
 * @param Replace event command
 * @desc Команда используюмая в событиях, например "ReplaceEvent бомж 1 1 1 1". Регистронезависима.
 * @default replace Event
 *
 * @help
 * Позволяет управлять событиями, делая перманентные изменения. Для создания событий, вам неоходимо создать карты с событиями, которые вы хотите "склонировать", а затем добавить ид карт в параметр "Templates". Теперь вы можете использовать шаблонные события по их имени.
 * Есть два способа управлять событиями: с помощью javascript (JS) и командой плагина (PC). Оба варианта равнозначны.
 *
 * JS: EventFactory.createEvent(eventName, x, y, mapId, variableId)
 * PC: create Event eventName x y mapId variableId
 * Создает событие из шаблона по имени "eventName", в координатах x, y. Если mapId не указан - создает событие на текущей карте. Если variableId указан - сохраняет ид нового события в указанный слот переменных.
 *
 * JS: EventFactory.removeEvent(id, mapId)
 * PC: remove Event id mapId
 * Навечно удаляет событие с id из игры. Если карта не указана - удаляет с текущей карты.
 *
 * JS: EventFactory.replaceEvent(eventName, id, x, y, mapId)
 * PC: replace Event eventName, id, x, y, mapId
 * Заменяет событие с указаным id событием с указанным именем. Если координаты не указаны - пытается сохранить положение события. Если mapId не указан - заменяет событие на текущей карте.
 */

/* Some unnecessary stuff */
var Amphicore, CommonFactoryCommand, CreateFactoryCommand, EventFactory, Imported, NothingFactoryCommand, RemoveFactoryCommand, ReplaceFactoryCommand,
    extend = function(child, parent) {
        for (var key in parent) {
            if (hasProp.call(parent, key)) child[key] = parent[key];
        }

        function ctor() {
            this.constructor = child;
        }
        ctor.prototype = parent.prototype;
        child.prototype = new ctor();
        child.__super__ = parent.prototype;
        return child;
    },
    hasProp = {}.hasOwnProperty;

Imported = Imported || {};

Imported.EventFactory = 0.1;


/* HORSE CORE */

Amphicore = (function() {
    function Amphicore() {}

    Amphicore.pluginRoutes = {};


    /* for preloading purposes only. If you want suggest better async solution - i would gladly hear (maybe) */

    Amphicore.loadSync = function(resource) {
        var data, url, xhr;
        data = null;
        xhr = new XMLHttpRequest();
        url = resource;
        xhr.open('GET', url, false);
        xhr.overrideMimeType('application/json');
        xhr.onload = function() {
            if (xhr.status < 400) {
                return data = JSON.parse(xhr.responseText);
            }
        };
        xhr.onerror = this._mapLoader || function() {
            return DataManager._errorUrl = DataManager._errorUrl || url;
        };
        xhr.send();
        return data;
    };


    /* adds command to plugin commands */

    Amphicore.addRouterCommand = function(route, callback, bind) {
        var command, i, lastWord, len, node, word, words;
        command = new this.PluginCommand(route, callback, bind);
        words = route.split(' ');
        lastWord = words.pop();
        node = this.pluginRoutes;
        for (i = 0, len = words.length; i < len; i++) {
            word = words[i];
            node[word] || (node[word] = {});
            node = node[word];
        }
        return node[lastWord] = command;
    };


    /* executes plugin command */

    Amphicore.executePluginCommand = function(command, args) {
        var fullRequest, i, len, node, remainArgs, word;
        fullRequest = [command].concat(args);
        remainArgs = JsonEx.makeDeepCopy(fullRequest);
        node = this.pluginRoutes;
        for (i = 0, len = fullRequest.length; i < len; i++) {
            word = fullRequest[i];
            if (node[word]) {
                node = node[word];
                remainArgs.shift();
                if (node instanceof Amphicore.PluginCommand) {
                    node.invoke(remainArgs);
                    return true;
                }
            } else {
                return false;
            }
        }
        return false;
    };

    return Amphicore;

})();


/* class for registered plugin commands */

Amphicore.PluginCommand = (function() {
    function PluginCommand(route, callback1, bind1) {
        this.callback = callback1;
        this.bind = bind1;
        this.route = route.toUpperCase();
    }

    PluginCommand.prototype.invoke = function(args) {
        return this.callback.apply(this.bind || this.command, args);
    };

    return PluginCommand;

})();


/* Events factory module contains all basic functions */

EventFactory = (function() {
    function EventFactory() {}

    EventFactory.factoryTemplates = {};

    EventFactory.eventFactoryIndexes = {};

    EventFactory.varId = PluginManager.parameters('EventFactory')['Default id variable'];


    /* preload all events to cache */

    EventFactory.loadTemplates = function() {
        var i, len, results, template, templates;
        templates = PluginManager.parameters('EventFactory')['Templates'];
        if (templates=='[]') alert('добавьте ID карты в поле "Templates" настройках плагина');//Yuryol
        templates = templates.substring(1, templates.length - 1).replace(/"/g, '').split(',');
        results = [];
        for (i = 0, len = templates.length; i < len; i++) {
            template = templates[i];
            results.push(this.loadTemplate(template * 1));
        }
        return results;
    };


    /* preload all events to cache from specific map */

    EventFactory.loadTemplate = function(mapId) {
        var event, i, len, map, ref, results;
        mapId = 'data/Map%1.json'.format(mapId.padZero(3));
        if (mapId=='data/Map000.json') return;//правка от Yuryol
        map = Amphicore.loadSync(mapId);
        ref = map.events;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
            event = ref[i];
            if (event != null) {
                results.push(this.factoryTemplates[event.name.trim()] = event);//yuryol - убрал пробелы
            } else {
                results.push(void 0);
            }
        }
        return results;
    };


    /* gets original event mapping, which would help us to create commands. Cached. */

    EventFactory.getEventIndexes = function(mapId) {
        var indexes;
        indexes = this.eventFactoryIndexes[mapId];
        if (indexes == null) {
            return this.eventFactoryIndexes[mapId] = this.stripIndexes(Amphicore.loadSync('data/Map%1.json'.format(mapId.padZero(3))));
        }
        return indexes;
    };


    /* gets mapping from specific map */

    EventFactory.stripIndexes = function(map) {
        var event, i, indexes, len, ref;
        indexes = [];
        ref = map.events;
        for (i = 0, len = ref.length; i < len; i++) {
            event = ref[i];
            if (event != null) {
                indexes.push(event.id);
            }
        }
        return indexes;
    };


    /* gets commands mapping for map. Cached. */

    EventFactory.getFactoryEvents = function(mapId) {
        var events, i, index, indexes, len;
        events = window.$gameEventFactory[mapId];
        if (events == null) {
            events = {};
            window.$gameEventFactory[mapId] = events;
            indexes = this.getEventIndexes(mapId);

            /* placing empty factory commands to simplify search for free ids */
            for (i = 0, len = indexes.length; i < len; i++) {
                index = indexes[i];
                events[index] = new NothingFactoryCommand();
            }
        }
        return events;
    };


    /* seek for free id on map */

    EventFactory.getFreeId = function(mapId) {
        var currentId, events;
        events = this.getFactoryEvents(mapId);
        currentId = 1;
        while (true) {

            /* if there is no original event or remove command */
            if (!(((events[currentId] != null) && events[currentId].type !== 'remove') || this.getEventIndexes[currentId])) {
                return currentId;
            }
            currentId++;
        }
    };


    /* searching for map's scene */

    EventFactory.getSceneMap = function() {

        /* @TODO: check parse stack */
        var i, len, ref, scene;
        if (SceneManager._scene instanceof Scene_Map) {
            return SceneManager._scene;
        }
        ref = SceneManager._stack;
        for (i = 0, len = ref.length; i < len; i++) {
            scene = ref[i];
            if (scene instanceof Scene_Map) {
                return scene;
            }
        }
        return null;
    };


    /* function to create event */

    EventFactory.createEvent = function(name, x, y, mapId, variableId) {
        var command, events, freeId;
        x = Number(x);
        y = Number(y);
        if (mapId) {
            mapId = Number(mapId);
        } else {
            mapId = $gameMap.mapId();
        }
        if (!variableId) {
            variableId = this.varId;
        }
        variableId = Number(variableId);
        events = this.getFactoryEvents(mapId);
        freeId = this.getFreeId(mapId);
        command = new CreateFactoryCommand(name, freeId, x, y);
        events[freeId] = command;
        if (variableId) {
            $gameVariables.setValue(variableId, freeId);
        }
        if (mapId === $gameMap.mapId()) {
            $gameMap.applyFactoryCommand(command);
        }
        return freeId;
    };


    /* function to destroy event */

    EventFactory.removeEvent = function(id, mapId) {
        var command, events;
        if (id) {
            id = Number(id);
        } else {
            id = $gameVariables.value(this.varId);
        }
        if (mapId) {
            mapId = Number(mapId);
        } else {
            mapId = $gameMap.mapId();
        }
        mapId || (mapId = $gameMap.mapId());
        events = this.getFactoryEvents(mapId);
        command = new RemoveFactoryCommand(id);

        /* in case original event existed - keep remove command, otherwise we don't need command */
        if (this.getEventIndexes(mapId).indexOf(id) !== -1) {
            events[id] = command;
        } else {
            delete events[id];
        }
        if (mapId === $gameMap.mapId()) {
            return $gameMap.applyFactoryCommand(command);
        }
    };


    /* function to replace event */

    EventFactory.replaceEvent = function(name, id, x, y, mapId) {
        var command, events;
        if (id) {
            id = Number(id);
        } else {
            id = $gameVariables.value(this.varId);
        }
        if (x) {
            x = Number(x);
        }
        if (y) {
            y = Number(y);
        }
        if (mapId) {
            mapId = Number(mapId);
        } else {
            mapId = $gameMap.mapId();
        }
        events = this.getFactoryEvents(mapId);
        command = new ReplaceFactoryCommand(name, id, x, y);

        /* in case original event existed - keep replace command, otherwise we just store creation command */
        if (this.getEventIndexes(mapId).indexOf(id) !== -1) {
            events[id] = command;
        } else {
            events[id] = new CreateFactoryCommand(name, id, events[id].x, events[id].y);
        }
        if (mapId === $gameMap.mapId()) {
            return $gameMap.applyFactoryCommand(command);
        }
    };

    return EventFactory;

})();


/*
  Command pattern which apply changes to map. Serializable.
  All commands represent difference between original map and modified.
 */


/* Basic command */

CommonFactoryCommand = (function() {
    function CommonFactoryCommand() {}


    /* get type of command */

    CommonFactoryCommand.prototype.type = function() {};


    /* makes deep copy of event and apply new parameters to it */

    CommonFactoryCommand.prototype.extendEvent = function(opts) {
        var event, key, value, name;
        opts || (opts = {});
        name = this.name.trim();//Yuryol для обрезки пробелов
        if (!EventFactory.factoryTemplates[name]) alert(`На карте-палитре нет события с именем  "${name}"`);
        event = JsonEx.makeDeepCopy(EventFactory.factoryTemplates[name]);
        for (key in opts) {
            value = opts[key];
            event[key] = value;
        }
        return event;
    };


    /* callback which runs on map loading */

    CommonFactoryCommand.prototype.execute = function(events) {};


    /*
  callback which runs on current map
  primarily tries to work with spritesets
   */

    CommonFactoryCommand.prototype.executeCurrentMap = function(gameMap) {};

    return CommonFactoryCommand;

})();


/* Command for putting new events */

CreateFactoryCommand = (function(superClass) {
    extend(CreateFactoryCommand, superClass);

    function CreateFactoryCommand(name1, id1, x1, y1) {
        this.name = name1;
        this.id = id1;
        this.x = x1;
        this.y = y1;
    }

    CreateFactoryCommand.prototype.type = function() {
        return 'create';
    };

    CreateFactoryCommand.prototype.execute = function(events) {
        return events[this.id] = this.extendEvent({
            id: this.id,
            x: this.x,
            y: this.y
        });
    };

    CreateFactoryCommand.prototype.executeCurrentMap = function(gameMap) {
        var eventSprite, newEvent, sceneMap;
        this.execute($dataMap.events);
        newEvent = new Game_Event($gameMap.mapId(), this.id);
        gameMap._events[this.id] = newEvent;
        sceneMap = EventFactory.getSceneMap();
        if (!sceneMap) {
            console.log('Map\'s scene not found! This might be an error.');
            return;
        }
        eventSprite = new Sprite_Character(newEvent);
        sceneMap._spriteset._characterSprites.push(eventSprite);
        return sceneMap._spriteset._tilemap.addChild(eventSprite);
    };

    return CreateFactoryCommand;

})(CommonFactoryCommand);


/* Command for deleting events */

RemoveFactoryCommand = (function(superClass) {
    extend(RemoveFactoryCommand, superClass);

    function RemoveFactoryCommand(id1) {
        this.id = id1;
    }

    RemoveFactoryCommand.prototype.type = function() {
        return 'remove';
    };

    RemoveFactoryCommand.prototype.execute = function(events) {
        return delete events[this.id];
    };

    RemoveFactoryCommand.prototype.executeCurrentMap = function(gameMap) {
        var idx, oldEvent, results, sceneMap, sprite, sprites;
        oldEvent = gameMap._events[this.id];
        delete gameMap._events[this.id];
        sceneMap = EventFactory.getSceneMap();
        if (!sceneMap) {
            console.log('Map\'s scene not found! This might be an error.');
            return;
        }
        if (!oldEvent) {
            return;
        }
        sprites = sceneMap._spriteset._characterSprites;
        results = [];
        for (idx in sprites) {
            sprite = sprites[idx];
            if (sprite._character._eventId === oldEvent._eventId) {
                delete sceneMap._spriteset._characterSprites[idx];
                results.push(sceneMap._spriteset._tilemap.removeChild(sprite));
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    return RemoveFactoryCommand;

})(CommonFactoryCommand);


/* Command for replacing events */

ReplaceFactoryCommand = (function(superClass) {
    extend(ReplaceFactoryCommand, superClass);

    function ReplaceFactoryCommand(name1, id1, x1, y1) {
        this.name = name1;
        this.id = id1;
        this.x = x1;
        this.y = y1;
    }

    ReplaceFactoryCommand.prototype.type = function() {
        return 'replace';
    };

    ReplaceFactoryCommand.prototype.execute = function(events) {
        var originalEvent;
        originalEvent = events[this.id];

        /* @TODO decide if i want to save original position or current */
        if (!this.x) {
            this.x || (this.x = originalEvent.x);
        }
        if (!this.y) {
            this.y || (this.y = originalEvent.y);
        }
        return events[this.id] = this.extendEvent({
            id: this.id,
            x: this.x,
            y: this.y
        });
    };

    ReplaceFactoryCommand.prototype.executeCurrentMap = function(gameMap) {
        var eventSprite, idx, newEvent, oldEvent, sceneMap, sprite, sprites;
        oldEvent = gameMap._events[this.id];
        sceneMap = EventFactory.getSceneMap();
        if (!sceneMap) {
            console.log('Map\'s scene not found! This might be an error.');
            return;
        }
        sprites = sceneMap._spriteset._characterSprites;
        for (idx in sprites) {
            sprite = sprites[idx];
            if (sprite._character._eventId === oldEvent._eventId) {
                delete sceneMap._spriteset._characterSprites[idx];
                sceneMap._spriteset._tilemap.removeChild(sprite);
            }
        }
        $dataMap.events[this.id] = this.extendEvent({
            id: this.id,
            x: oldEvent.x,
            y: oldEvent.y
        });
        newEvent = new Game_Event($gameMap.mapId(), this.id);
        gameMap._events[this.id] = newEvent;
        eventSprite = new Sprite_Character(newEvent);
        sceneMap._spriteset._characterSprites.push(eventSprite);
        return sceneMap._spriteset._tilemap.addChild(eventSprite);
    };

    return ReplaceFactoryCommand;

})(CommonFactoryCommand);

NothingFactoryCommand = (function(superClass) {
    extend(NothingFactoryCommand, superClass);

    function NothingFactoryCommand() {
        return NothingFactoryCommand.__super__.constructor.apply(this, arguments);
    }

    return NothingFactoryCommand;

})(CommonFactoryCommand);


/* dumping commands on saving game */

DataManager._eventFactoryMakeSaveContents = DataManager.makeSaveContents;

DataManager.makeSaveContents = function() {
    var contents;
    contents = DataManager._eventFactoryMakeSaveContents();
    contents.eventFactory = $gameEventFactory;
    return contents;
};


/* loading commands on loading game */

DataManager._eventFactoryExtractSaveContents = DataManager.extractSaveContents;

DataManager.extractSaveContents = function(contents) {
    DataManager._eventFactoryExtractSaveContents(contents);
    return window.$gameEventFactory = contents.eventFactory;
};


/* creating empty commands on new game */

DataManager._eventFactoryCreateGameObjects = DataManager.createGameObjects;

DataManager.createGameObjects = function() {
    this._eventFactoryCreateGameObjects();
    return window.$gameEventFactory = {};
};


/* injecting events from factory on loading map */

DataManager._eventFactoryOnLoad = DataManager.onLoad;

DataManager.onLoad = function(object) {

    /* check if we loaded map */
    var _, command, commands, mapId, sceneMap;
    if (object === $dataMap) {
        sceneMap = EventFactory.getSceneMap();

        /* this gross thing stealed from SceneManager */
        mapId = sceneMap && sceneMap._transfer ? $gamePlayer.newMapId() : $gameMap.mapId();
        if (mapId > 0) {

            /* actual injecting */
            commands = EventFactory.getFactoryEvents(mapId);
            if (commands != null) {
                for (_ in commands) {
                    command = commands[_];
                    command.execute(object.events);
                }
            }
        }
    }
    return this._eventFactoryOnLoad(object);
};


/* method to apply command on current map */

Game_Map.prototype.applyFactoryCommand = function(command) {
    command.executeCurrentMap(this);
    return this.refreshTileEvents();
};

Game_Interpreter.prototype._amphicorePluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {

    /* if routing fails fallback to original "routing" */
    if (!Amphicore.executePluginCommand(command, args)) {
        return this._amphicorePluginCommand(command, args);
    }
};


/* register plugin manager commands */

Amphicore.addRouterCommand(PluginManager.parameters('EventFactory')['Create event command'], EventFactory.createEvent, EventFactory);

Amphicore.addRouterCommand(PluginManager.parameters('EventFactory')['Remove event command'], EventFactory.removeEvent, EventFactory);

Amphicore.addRouterCommand(PluginManager.parameters('EventFactory')['Replace event command'], EventFactory.replaceEvent, EventFactory);


/* prepeare all templates */

EventFactory.loadTemplates();