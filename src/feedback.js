/**
 * Avisos y confirmaciones de toda la aplicación, como estado de módulo.
 *
 * Hasta ahora no había forma de avisar: un formulario generado se tragaba
 * cualquier error que no fuera de validación, la tabla solo lo escribía en la
 * consola y la confirmación de borrar era un SweetAlert de otro paquete. Cada
 * pieza que quisiera decir algo tendría que haber montado su propio aviso.
 *
 * Vive aquí, fuera de Vue y de React, por la misma razón que el tema: los dos
 * paquetes de componentes pintan la misma cola, y quien avisa —un store, un
 * contrato de modelo, la tabla— no tiene por qué saber qué framework hay
 * detrás.
 *
 *     import { notify, confirmAction } from 'innoboxrr-form-core'
 *
 *     notify({ message: 'Producto creado', variant: 'success' })
 *
 *     if (await confirmAction({ message: '¿Borrar el producto?', variant: 'danger' })) {
 *         // …
 *     }
 */

/**
 * @typedef {'info'|'success'|'warning'|'danger'} Variant
 * @typedef {{ id: number, title: string|null, message: string, variant: Variant, duration: number }} Toast
 * @typedef {{ id: number, title: string, message: string, confirmLabel: string, cancelLabel: string, variant: 'primary'|'danger' }} Confirmation
 */

const VARIANTS = ['info', 'success', 'warning', 'danger']

const DURATION = 5000

/**
 * Más avisos a la vez no se leen: tapan la pantalla. El que sobra es el más
 * antiguo.
 */
const MAX_TOASTS = 5

// AVISOS

/** @type {Toast[]} */
let toasts = []

let nextToast = 1

/** @type {Map<number, ReturnType<typeof setTimeout>>} */
const timers = new Map()

/** @type {Set<(toasts: Toast[]) => void>} */
const toastListeners = new Set()

const emitToasts = () => toastListeners.forEach((listener) => listener(toasts))

/**
 * Muestra un aviso y devuelve su id.
 *
 * Un aviso de peligro no se cierra solo por defecto: quien no lo leyó a tiempo
 * no sabría qué falló. El resto se va a los cinco segundos. `duration: 0` lo
 * deja hasta que se cierre a mano.
 *
 * @param {string|{ message: string, title?: string, variant?: Variant, duration?: number }} options
 * @returns {number}
 */
export function notify(options) {
    const input = typeof options === 'string' ? { message: options } : (options ?? {})
    const variant = VARIANTS.includes(input.variant) ? input.variant : 'info'
    const duration = input.duration ?? (variant === 'danger' ? 0 : DURATION)

    /** @type {Toast} */
    const toast = {
        id: nextToast++,
        title: input.title ?? null,
        message: String(input.message ?? ''),
        variant,
        duration,
    }

    // Se reemplaza el array en vez de mutarlo: React compara la instantánea
    // por referencia y, con el mismo array, no repintaría.
    toasts = [...toasts, toast]

    while (toasts.length > MAX_TOASTS) {
        forget(toasts[0].id)
        toasts = toasts.slice(1)
    }

    if (duration > 0) {
        timers.set(toast.id, setTimeout(() => dismiss(toast.id), duration))
    }

    emitToasts()

    return toast.id
}

/**
 * @param {string} message
 * @param {{ title?: string, duration?: number }} [options]
 */
export function notifySuccess(message, options = {}) {
    return notify({ ...options, message, variant: 'success' })
}

/**
 * @param {string} message
 * @param {{ title?: string, duration?: number }} [options]
 */
export function notifyError(message, options = {}) {
    return notify({ ...options, message, variant: 'danger' })
}

/**
 * @param {number} id
 */
export function dismiss(id) {
    forget(id)

    const remaining = toasts.filter((toast) => toast.id !== id)

    if (remaining.length !== toasts.length) {
        toasts = remaining
        emitToasts()
    }
}

/** @returns {Toast[]} */
export function getToasts() {
    return toasts
}

/**
 * @param {(toasts: Toast[]) => void} listener
 * @returns {() => void}  para dejar de escuchar
 */
export function onToastsChange(listener) {
    toastListeners.add(listener)

    return () => toastListeners.delete(listener)
}

/**
 * Vacía la cola. Sobre todo para las pruebas: sin esto un aviso de una prueba
 * aparecería en la siguiente.
 */
export function resetToasts() {
    timers.forEach((timer) => clearTimeout(timer))
    timers.clear()

    toasts = []
    nextToast = 1

    emitToasts()
}

/**
 * @param {number} id
 */
function forget(id) {
    clearTimeout(timers.get(id))
    timers.delete(id)
}

// CONFIRMACIONES

/** @type {Confirmation|null} */
let confirmation = null

/** @type {((value: boolean) => void)|null} */
let resolver = null

let nextConfirmation = 1

/** @type {Set<(confirmation: Confirmation|null) => void>} */
const confirmationListeners = new Set()

const emitConfirmation = () => confirmationListeners.forEach((listener) => listener(confirmation))

/**
 * Pregunta y espera la respuesta: `true` si se confirma, `false` si no.
 *
 * La pinta el ConfirmHostComponent que la aplicación monta una vez. Si no hay
 * ninguno escuchando se usa `window.confirm`, que es feo pero contesta: una
 * promesa que no se resolviera nunca dejaría colgada la acción que la espera.
 *
 * Una pregunta nueva con otra pendiente da la anterior por cancelada. Dos
 * confirmaciones a la vez no tienen una respuesta clara.
 *
 * @param {string|{ message: string, title?: string, confirmLabel?: string, cancelLabel?: string, variant?: 'primary'|'danger' }} options
 * @returns {Promise<boolean>}
 */
export function confirmAction(options) {
    const input = typeof options === 'string' ? { message: options } : (options ?? {})
    const message = String(input.message ?? '')

    if (confirmationListeners.size === 0) {
        const native = typeof window !== 'undefined' ? window.confirm : undefined

        return Promise.resolve(typeof native === 'function' ? Boolean(native.call(window, message)) : false)
    }

    if (resolver) {
        settle(false)
    }

    return new Promise((resolve) => {
        resolver = resolve

        confirmation = {
            id: nextConfirmation++,
            title: input.title ?? '¿Confirmas?',
            message,
            confirmLabel: input.confirmLabel ?? 'Confirmar',
            cancelLabel: input.cancelLabel ?? 'Cancelar',
            variant: input.variant === 'danger' ? 'danger' : 'primary',
        }

        emitConfirmation()
    })
}

/**
 * La respuesta a la confirmación pendiente. La llama el componente que la pinta.
 *
 * @param {boolean} value
 */
export function resolveConfirmation(value) {
    if (resolver) {
        settle(Boolean(value))
    }
}

/** @returns {Confirmation|null} */
export function getConfirmation() {
    return confirmation
}

/**
 * @param {(confirmation: Confirmation|null) => void} listener
 * @returns {() => void}  para dejar de escuchar
 */
export function onConfirmationChange(listener) {
    confirmationListeners.add(listener)

    return () => confirmationListeners.delete(listener)
}

/**
 * Cancela lo pendiente. Sobre todo para las pruebas.
 */
export function resetConfirmation() {
    if (resolver) {
        settle(false)

        return
    }

    confirmation = null
    emitConfirmation()
}

/**
 * @param {boolean} value
 */
function settle(value) {
    const resolve = resolver

    resolver = null
    confirmation = null

    emitConfirmation()

    resolve?.(value)
}
