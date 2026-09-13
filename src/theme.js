/**
 * El tema del ecosistema innoboxrr: un mapa de tokens que la aplicacion
 * ajusta una vez, al arrancar, y que leen los dos paquetes de componentes.
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

/**
 * Los tokens apuntan a las clases del sistema de diseno propio, no a las de
 * un framework ajeno.
 *
 * Antes cada valor era una cadena que mezclaba UIkit, Tailwind y Font Awesome
 * —`uk-input uk-form-large uk-border-rounded`— y ninguno de esos frameworks
 * estaba declarado como dependencia: el paquete solo funcionaba dentro de una
 * aplicacion que ya los trajera cargados, y nada lo decia. Ademas el modo
 * oscuro iba incrustado en cada cadena, repetido treinta veces.
 *
 * Ahora las clases son nuestras y su aspecto sale de las variables de
 * `tokens.css`, donde el modo oscuro se define una sola vez. Cambiar el color
 * principal del ecosistema vuelve a ser editar una linea.
 *
 * @type {Theme}
 */
export const defaultTheme = {
    // ENVOLTORIOS
    field: 'fe-field',
    fieldInner: 'fe-field-inner',
    label: 'fe-label',
    help: 'fe-help',
    helpIcon: 'fe-help-icon',
    error: 'fe-error',

    // CONTROLES
    input: 'fe-input',
    select: 'fe-select',
    textarea: 'fe-textarea',
    checkbox: 'fe-checkbox',
    radio: 'fe-radio',
    file: 'fe-file',
    fileDrop: 'fe-file-drop',
    fileDropHint: 'fe-file-drop-hint',
    avatarPreview: 'fe-avatar-preview',
    codeInput: 'fe-code-input',
    codeCell: 'fe-code-cell',
    group: 'fe-group',
    groupTitle: 'fe-group-title',
    dragHandle: 'fe-drag-handle',
    phone: 'fe-phone',
    phoneInvalid: 'fe-phone-invalid',

    // BOTONES
    button: 'fe-button',
    buttonSecondary: 'fe-button-secondary',
    buttonDanger: 'fe-button-danger',
    buttonLink: 'fe-button-link',
    iconButton: 'fe-icon-button',
    iconButtonDanger: 'fe-icon-button-danger',

    // NAVEGACION Y ACCIONES
    breadcrumb: 'fe-breadcrumb',
    breadcrumbLink: 'fe-breadcrumb-link',
    breadcrumbCurrent: 'fe-breadcrumb-current',
    breadcrumbSeparator: 'fe-breadcrumb-separator',
    actionMenu: 'fe-action-menu',
    actionMenuItem: 'fe-action-item',
    actionMenuDanger: 'fe-action-danger',
    kbd: 'fe-kbd',

    // SUPERFICIES Y PIEZAS DE APLICACION
    surface: 'fe-surface',
    surfaceRaised: 'fe-surface-raised',
    toolbar: 'fe-toolbar',
    badge: 'fe-badge',
    badgePrimary: 'fe-badge-primary',
    badgeSuccess: 'fe-badge-success',
    badgeDanger: 'fe-badge-danger',
    badgeWarning: 'fe-badge-warning',
    skeleton: 'fe-skeleton',
    skeletonText: 'fe-skeleton-text',
    skeletonCircle: 'fe-skeleton-circle',
    skeletonBlock: 'fe-skeleton-block',

    // DIALOGOS Y DRAWERS, sobre <dialog> y showModal()
    overlay: 'fe-overlay',
    dialog: 'fe-dialog',
    dialogSmall: 'fe-dialog-sm',
    dialogLarge: 'fe-dialog-lg',
    dialogHeader: 'fe-dialog-header',
    dialogTitle: 'fe-dialog-title',
    dialogBody: 'fe-dialog-body',
    dialogFooter: 'fe-dialog-footer',
    drawer: 'fe-drawer',
    drawerStart: 'fe-drawer-start',
    drawerHeader: 'fe-drawer-header',
    drawerTitle: 'fe-drawer-title',
    drawerBody: 'fe-drawer-body',
    drawerFooter: 'fe-drawer-footer',

    // MENUS, sobre el atributo popover
    menu: 'fe-menu',
    menuList: 'fe-menu-list',
    menuItem: 'fe-menu-item',
    menuItemDanger: 'fe-menu-item-danger',
    menuSeparator: 'fe-menu-separator',
    menuLabel: 'fe-menu-label',

    // PALETA DE COMANDOS
    command: 'fe-command',
    commandInput: 'fe-command-input',
    commandList: 'fe-command-list',
    commandGroup: 'fe-command-group',
    commandItem: 'fe-command-item',
    commandEmpty: 'fe-command-empty',

    // AVISOS
    toast: 'fe-toast',
    toastDanger: 'fe-toast-danger',
    toastSuccess: 'fe-toast-success',
    toastWarning: 'fe-toast-warning',
    toastTitle: 'fe-toast-title',
    toastClose: 'fe-toast-close',
    toastRegion: 'fe-toast-region',

    // TABLA
    table: 'fe-table',
    tableNumeric: 'fe-numeric',
    tableSticky: 'fe-table-sticky',
    tableSelect: 'fe-table-select',
    tableResizer: 'fe-table-resizer',
    tableEmpty: 'fe-table-empty',
    bulkBar: 'fe-bulk-bar',
    bulkCount: 'fe-bulk-count',
    tableSort: 'fe-table-sort',
    tableContainer: 'fe-table-container',
    tableFooter: 'fe-table-footer',
    tablePager: 'fe-table-pager',
    datatable: 'fe-datatable',
    datatableFilters: 'fe-datatable-filters',
    toolbarSpacer: 'fe-toolbar-spacer',

    // EDICION EN LINEA
    editable: 'fe-editable',

    // SHELL DE APLICACION
    shell: 'fe-shell',
    shellHeader: 'fe-shell-header',
    shellSidebar: 'fe-shell-sidebar',
    shellMain: 'fe-shell-main',
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
