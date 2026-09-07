/**
 * Las clases CSS de los formularios, en un solo sitio.
 *
 * Antes cada componente llevaba su cadena incrustada como valor por defecto de
 * `customClass`, repetida en los dos paquetes; y el codigo generado por
 * larapack esperaba `inputClass` y `buttonClass` de un mixin global que la
 * aplicacion anfitriona tenia que registrar sin que nada lo dijera.
 *
 * Ahora hay un tema: un mapa de tokens que la aplicacion ajusta una vez, al
 * arrancar, y que leen los dos paquetes de componentes.
 *
 *     import { setTheme } from 'innoboxrr-form-core'
 *
 *     setTheme({ input: 'form-control', button: 'btn btn-primary' })
 *
 * Un componente sigue admitiendo `customClass` para el caso puntual; lo que
 * cambia es que ya no es la unica forma de cambiar el aspecto de todo.
 */

/**
 * @typedef {Record<string, string>} Theme
 */

/** @type {Theme} */
export const defaultTheme = {
    // ENVOLTORIOS
    field: 'uk-margin',
    fieldInner: 'uk-inline uk-width-1-1',
    label: 'ml-2 text-sm font-medium text-gray-900 dark:text-white',
    help: 'cursor-pointer',
    helpIcon: 'fa-solid fa-circle-question',
    error: 'fe-input-error text-red-600 font-bold',

    // CONTROLES
    input: 'uk-input uk-form-large uk-border-rounded',
    select: 'uk-select uk-form-large uk-border-rounded',
    textarea: 'uk-textarea uk-form-large uk-border-rounded',
    checkbox: 'uk-checkbox',
    radio: 'uk-radio',
    file: 'uk-input uk-form-large uk-border-rounded',

    // BOTONES
    button: 'uk-button uk-width-1-1 button',
    buttonSecondary: 'uk-button uk-button-default',
    buttonDanger: 'uk-button uk-button-danger',
    buttonLink: 'uk-button uk-button-link',
}

/** @type {Theme} */
let theme = { ...defaultTheme }

/**
 * Los oyentes existen para que un componente ya montado se entere de un cambio
 * de tema. Sin esto, `setTheme` en caliente solo afectaria a lo que se montara
 * despues.
 *
 * @type {Set<(theme: Theme) => void>}
 */
const listeners = new Set()

/**
 * Ajusta el tema. Se mezcla con el actual, asi que se puede cambiar un token
 * sin repetir los demas.
 *
 * @param {Partial<Theme>} tokens
 * @returns {Theme}
 */
export function setTheme(tokens = {}) {
    theme = { ...theme, ...tokens }

    listeners.forEach((listener) => listener(theme))

    return theme
}

/**
 * Devuelve el tema completo, o la clase de un token.
 *
 * @param {string} [token]
 * @returns {Theme|string}
 */
export function getTheme(token) {
    return token === undefined ? theme : (theme[token] ?? '')
}

/**
 * La clase de un control, dejando que `customClass` mande cuando llegue.
 *
 * Es lo que llaman los componentes: el token da el aspecto de todo el
 * proyecto, y `customClass` resuelve el caso puntual.
 *
 * @param {string} token
 * @param {string|null|undefined} customClass
 * @returns {string}
 */
export function classFor(token, customClass) {
    return customClass ?? getTheme(token)
}

/**
 * Vuelve a los valores de fabrica. Sobre todo para las pruebas: un tema es
 * estado de modulo, y sin esto una prueba se filtraria a la siguiente.
 *
 * @returns {Theme}
 */
export function resetTheme() {
    theme = { ...defaultTheme }

    listeners.forEach((listener) => listener(theme))

    return theme
}

/**
 * @param {(theme: Theme) => void} listener
 * @returns {() => void}  para dejar de escuchar
 */
export function onThemeChange(listener) {
    listeners.add(listener)

    return () => listeners.delete(listener)
}
