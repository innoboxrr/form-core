/**
 * Los iconos del ecosistema: un nombre semantico, y un mapa que decide de
 * donde sale el dibujo.
 *
 * Antes hacian falta tres dependencias para pintar un icono: `uikit` ponia el
 * componente, `@fortawesome/fontawesome-free` los glifos y
 * `uikit-custom-icons` hacia de puente registrando los de Font Awesome dentro
 * del registro de UIkit. Por eso `icon: 'fa-plus'` funcionaba —porque alguien
 * escribio el puente—, y por eso dejaba de funcionar en cuanto faltaba
 * cualquiera de las tres.
 *
 * Ahora el componente recibe un nombre semantico (`plus`, `download`) y este
 * mapa dice a que icono corresponde. Los valores son nombres de Iconify
 * (`coleccion:icono`), que son 200.000 iconos de mas de 150 colecciones bajo
 * un solo esquema.
 *
 * Cambiar el aspecto de todo el proyecto es cambiar el mapa:
 *
 *     import { setIcons } from 'innoboxrr-form-core'
 *
 *     setIcons({ plus: 'lucide:plus', download: 'lucide:download' })
 *
 * Y un nombre de Iconify se puede pasar directo cuando haga falta uno suelto:
 * `iconFor('mdi:home')` devuelve `mdi:home`. El mapa es para lo que se repite,
 * no una aduana.
 */

/**
 * @typedef {Record<string, string>} IconMap
 */

/** @type {IconMap} */
export const defaultIcons = {
    // ACCIONES
    plus: 'fa6-solid:plus',
    download: 'fa6-solid:download',
    upload: 'fa6-solid:upload',
    edit: 'fa6-solid:pen',
    delete: 'fa6-solid:trash',
    show: 'fa6-solid:eye',
    hide: 'fa6-solid:eye-slash',
    actions: 'fa6-solid:gears',
    refresh: 'fa6-solid:rotate',
    search: 'fa6-solid:magnifying-glass',
    filter: 'fa6-solid:filter',

    // ESTADO
    help: 'fa6-solid:circle-question',
    warning: 'fa6-solid:triangle-exclamation',
    error: 'fa6-solid:circle-exclamation',
    success: 'fa6-solid:circle-check',
    info: 'fa6-solid:circle-info',
    locked: 'fa6-solid:lock',

    // NAVEGACION
    previous: 'fa6-solid:chevron-left',
    next: 'fa6-solid:chevron-right',
    up: 'fa6-solid:chevron-up',
    down: 'fa6-solid:chevron-down',
    close: 'fa6-solid:xmark',

    // OBJETOS
    box: 'fa6-solid:box',
    users: 'fa6-solid:users',
    gift: 'fa6-solid:gift',
    file: 'fa6-solid:file',
}

/** @type {IconMap} */
let icons = { ...defaultIcons }

/** @type {Set<(icons: IconMap) => void>} */
const listeners = new Set()

/**
 * Ajusta el mapa. Se mezcla con el actual, asi que se puede cambiar un icono
 * sin repetir los demas.
 *
 * @param {Partial<IconMap>} map
 * @returns {IconMap}
 */
export function setIcons(map = {}) {
    icons = { ...icons, ...map }

    listeners.forEach((listener) => listener(icons))

    return icons
}

/**
 * Devuelve el mapa completo, o el icono de un nombre.
 *
 * @param {string} [name]
 * @returns {IconMap|string}
 */
export function getIcon(name) {
    return name === undefined ? icons : (icons[name] ?? '')
}

/**
 * Resuelve un nombre a un icono de Iconify.
 *
 * Es lo que llaman los componentes. Acepta tres cosas:
 *
 *   - un nombre del mapa      → `plus`      → `fa6-solid:plus`
 *   - un nombre de Iconify    → `mdi:home`  → `mdi:home`
 *   - cualquier otra cosa     → se devuelve tal cual, para que el fallo se vea
 *
 * @param {string|null|undefined} name
 * @returns {string}
 */
export function iconFor(name) {
    if (! name) {
        return ''
    }

    if (icons[name]) {
        return icons[name]
    }

    // Ya viene con coleccion: es un nombre de Iconify y se pasa entero.
    if (name.includes(':')) {
        return name
    }

    return name
}

/**
 * Vuelve a los valores de fabrica. Sobre todo para las pruebas: el mapa es
 * estado de modulo y sin esto una prueba se filtraria a la siguiente.
 *
 * @returns {IconMap}
 */
export function resetIcons() {
    icons = { ...defaultIcons }

    listeners.forEach((listener) => listener(icons))

    return icons
}

/**
 * @param {(icons: IconMap) => void} listener
 * @returns {() => void}  para dejar de escuchar
 */
export function onIconChange(listener) {
    listeners.add(listener)

    return () => listeners.delete(listener)
}
