//=============================================================================
// RPG Maker MZ - Yuryol Custom Loader
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Custom loader.
 * @author Yuryol
 *
 * @help YuryolCustomLoader.js
 *
 * @param text HTML
 * @type text
 * @default '<div class="s1"><div class="s b sb1"></div><div class="s b sb2"></div><div class="s b sb3"></div><div class="s b sb4"></div></div><div class="s2"><div class="s b sb5"></div><div class="s b sb6"></div><div class="s b sb7"></div><div class="s b sb8"></div></div><div class="bigcon"><div class="big b"></div></div>'
 *
 * @param path file CSS
 * @type text
 * @default 1
*/

(() => {
    const parameters = PluginManager.parameters('YuryolCustomLoader')
    const html = parameters['text HTML']
    const pathCss = parameters['path file CSS']
    const head  = document.getElementsByTagName('head')[0]
    
    let link  = document.createElement('link')
    link.rel  = 'stylesheet'
    link.type = 'text/css';
    link.href = `/css/${pathCss}.css`
    head.appendChild(link)

    Graphics._createLoadingSpinner = function() {
        const loadingSpinner = document.createElement("div")
        loadingSpinner.id = "loadingSpinner"
        loadingSpinner.innerHTML = html
        this._loadingSpinner = loadingSpinner
    }

})()