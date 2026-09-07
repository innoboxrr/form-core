/**
 * Validación y descripción de archivos, antes de subirlos.
 *
 * No toca el DOM ni depende de ningún framework: entra una lista de `File` y
 * sale una lista de descriptores.
 */

/**
 * El icono genérico de un archivo sin vista previa.
 *
 * Antes esto era una URL de icon-library.com: cada archivo que no fuera imagen
 * disparaba una petición a un tercero, que además puede caerse o cambiar. Un
 * data URI no sale del navegador.
 */
export const FILE_ICON = 'data:image/svg+xml;utf8,'
    + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">'
        + '<path fill="#cbd5e1" d="M12 4h16l10 10v30H12z"/>'
        + '<path fill="#94a3b8" d="M28 4l10 10H28z"/>'
        + '</svg>'
    )

const IMAGE_TYPES = ['image/gif', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif']

/**
 * @typedef {object} FileRules
 * @property {number} [maxSize]      bytes; 0 o ausente significa sin límite
 * @property {string[]} [validMimes] lista blanca; ausente significa cualquiera
 */

/**
 * @typedef {object} FileEntry
 * @property {File} file
 * @property {string} name
 * @property {number} size
 * @property {string} type
 * @property {string} preview
 * @property {boolean} uploaded
 * @property {boolean} validation
 * @property {string[]} errors
 * @property {string|undefined} path
 * @property {string|number|undefined} id
 */

/**
 * @param {File} file
 * @returns {boolean}
 */
export function isImage(file) {
    return Boolean(file?.type?.startsWith('image/'))
}

/**
 * @param {File} file
 * @returns {boolean}
 */
export function isVideo(file) {
    return Boolean(file?.type?.startsWith('video/'))
}

/**
 * @param {File} file
 * @param {FileRules} rules
 * @returns {string[]}
 */
export function errorsFor(file, rules = {}) {
    const errors = []

    if (Array.isArray(rules.validMimes) && ! rules.validMimes.includes(file?.type)) {
        errors.push('failMimeValidation')
    }

    if (rules.maxSize && file?.size > rules.maxSize) {
        errors.push('failMaxSizeValidation')
    }

    return errors
}

/**
 * La vista previa de un archivo.
 *
 * `URL.createObjectURL` no existe en Node, ni en jsdom, ni en un render de
 * servidor. Sin la guarda, validar una imagen fuera del navegador lanzaba.
 *
 * @param {File} file
 * @returns {string}
 */
export function previewFor(file) {
    if (! IMAGE_TYPES.includes(file?.type)) {
        return FILE_ICON
    }

    if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
        return FILE_ICON
    }

    return URL.createObjectURL(file)
}

/**
 * Describe cada archivo sin tocarlo.
 *
 * La versión anterior escribía las propiedades **sobre el propio File** con
 * `Object.assign`. Funcionaba, pero dejaba objetos del navegador con campos
 * inventados y hacía imposible describir el mismo archivo dos veces con reglas
 * distintas. El `File` original sigue disponible en `.file`, que es lo que hay
 * que meter en el `FormData`.
 *
 * @param {File[]} files
 * @param {FileRules} rules
 * @returns {Promise<FileEntry[]>}
 */
export function validateFiles(files = [], rules = {}) {
    return Promise.resolve(describeFiles(files, rules))
}

/**
 * La versión síncrona. `validateFiles` devuelve una promesa por compatibilidad
 * con quien ya la esperaba, pero aquí no hay nada asíncrono.
 *
 * @param {File[]} files
 * @param {FileRules} rules
 * @returns {FileEntry[]}
 */
export function describeFiles(files = [], rules = {}) {
    return Array.from(files ?? []).map((file) => {
        const errors = errorsFor(file, rules)

        return {
            file,
            name: file?.name ?? '',
            size: file?.size ?? 0,
            type: file?.type ?? '',
            preview: previewFor(file),
            uploaded: false,
            validation: errors.length === 0,
            errors,
            path: undefined,
            id: undefined,
        }
    })
}

/**
 * Bytes en algo legible.
 *
 * @param {number} bytes
 * @returns {string}
 */
export function sizeParser(bytes) {
    if (! bytes) {
        return '0 Byte'
    }

    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)

    return `${Math.round(bytes / Math.pow(1024, unit))} ${units[unit]}`
}
