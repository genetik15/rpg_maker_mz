//=============================================================================
// RPG Maker MZ - Yuryol Event Factory
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Custom loader.
 * @author Yuryol
 *
 * @help YuryolCustomLoader.js
 *
 * @param id map palette
 * @type number
 * @default 2
 *
*/

(() => {
    const parameters = PluginManager.parameters('YuryolEventFactory')
    const idMapPalette = parameters['id map palette']
    
    SceneManager.showDevTools();
    Game_Event.prototype.initialize = function(mapId, eventId, x = false, y = false) {
        Game_Character.prototype.initialize.call(this);
        this._mapId = mapId;
        this._eventId = eventId;

        x = (x === false) ? this.event().x : x;
        y = (y === false) ? this.event().y : y;
        this.locate(x, y);
        this.refresh();
    };

    DataManager.loadMapData = function(mapId) {
        if (mapId > 0) {
            const filename = "Map%1.json".format(mapId.padZero(3));
            this.loadDataFile("$dataMap", filename);

            console.log(DataManager._databaseFiles) 
            const filenamePalette = "Map%1.json".format(Number(idMapPalette).padZero(3));
            this.loadDataFile("$dataMapPalette", filenamePalette);
        } else {
            this.makeEmptyMap();
        }
    };

    Game_Map.prototype.YuryolCreateEvents = function(id, x, y) {
        this._events[this._events.length] = new Game_Event(this._mapId, id, x, y);
        SceneManager._scene._spriteset.createCharacters();
    };
})()