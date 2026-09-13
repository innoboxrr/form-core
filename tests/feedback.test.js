import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    confirmAction,
    dismiss,
    getConfirmation,
    getToasts,
    notify,
    notifyError,
    notifySuccess,
    onConfirmationChange,
    onToastsChange,
    resetConfirmation,
    resetToasts,
    resolveConfirmation,
} from '../src/feedback.js'

describe('avisos', () => {
    beforeEach(() => vi.useFakeTimers())

    afterEach(() => {
        resetToasts()
        vi.useRealTimers()
    })

    it('un aviso tiene id, mensaje, variante y duracion', () => {
        const id = notify({ message: 'Guardado', title: 'Producto', variant: 'success' })

        expect(getToasts()).toEqual([{ id, title: 'Producto', message: 'Guardado', variant: 'success', duration: 5000 }])
    })

    it('acepta solo el mensaje', () => {
        notify('Hola')

        expect(getToasts()[0]).toMatchObject({ message: 'Hola', variant: 'info', title: null })
    })

    it('una variante desconocida es informativa', () => {
        notify({ message: 'x', variant: 'rainbow' })

        expect(getToasts()[0].variant).toBe('info')
    })

    it('se va solo cuando pasa su duracion', () => {
        notify('Guardado')

        vi.advanceTimersByTime(4999)
        expect(getToasts()).toHaveLength(1)

        vi.advanceTimersByTime(1)
        expect(getToasts()).toHaveLength(0)
    })

    /**
     * Quien no leyó un error a tiempo no sabría qué falló.
     */
    it('un error no se va solo', () => {
        notifyError('No se pudo guardar')

        vi.advanceTimersByTime(60_000)

        expect(getToasts()).toHaveLength(1)
        expect(getToasts()[0].duration).toBe(0)
    })

    it('se cierra a mano, y su temporizador ya no hace nada', () => {
        const id = notifySuccess('Guardado')
        const listener = vi.fn()

        dismiss(id)
        onToastsChange(listener)
        vi.advanceTimersByTime(10_000)

        expect(getToasts()).toEqual([])
        expect(listener).not.toHaveBeenCalled()
    })

    /**
     * React compara la instantánea por referencia: con el mismo array mutado
     * no repintaría.
     */
    it('cada cambio entrega un array nuevo', () => {
        const antes = getToasts()

        notify('x')

        expect(getToasts()).not.toBe(antes)
    })

    it('avisa a quien escuche y deja de hacerlo', () => {
        const listener = vi.fn()
        const stop = onToastsChange(listener)

        notify('x')
        stop()
        notify('y')

        expect(listener).toHaveBeenCalledTimes(1)
    })

    it('no apila mas de cinco: sale el mas antiguo', () => {
        const ids = [1, 2, 3, 4, 5, 6].map((n) => notify({ message: `m${n}`, duration: 0 }))

        expect(getToasts().map((toast) => toast.id)).toEqual(ids.slice(1))
    })
})

describe('confirmaciones', () => {
    let stop = () => {}

    beforeEach(() => {
        // Un anfitrión montado: sin él se usaría window.confirm.
        stop = onConfirmationChange(() => {})
    })

    afterEach(() => {
        resetConfirmation()
        stop()
    })

    it('espera la respuesta y la devuelve', async () => {
        const answer = confirmAction({ message: '¿Borrar?', variant: 'danger' })

        expect(getConfirmation()).toMatchObject({
            message: '¿Borrar?',
            variant: 'danger',
            title: '¿Confirmas?',
            confirmLabel: 'Confirmar',
            cancelLabel: 'Cancelar',
        })

        resolveConfirmation(true)

        await expect(answer).resolves.toBe(true)
        expect(getConfirmation()).toBeNull()
    })

    it('cancelar es false', async () => {
        const answer = confirmAction('¿Seguro?')

        resolveConfirmation(false)

        await expect(answer).resolves.toBe(false)
    })

    it('una pregunta nueva da la pendiente por cancelada', async () => {
        const primera = confirmAction('¿Uno?')
        const segunda = confirmAction('¿Dos?')

        await expect(primera).resolves.toBe(false)
        expect(getConfirmation().message).toBe('¿Dos?')

        resolveConfirmation(true)

        await expect(segunda).resolves.toBe(true)
    })

    /**
     * Una promesa que no se resolviera nunca dejaría colgada la acción que la
     * espera.
     */
    it('sin nadie que la pinte, usa window.confirm', async () => {
        stop()

        const native = vi.spyOn(window, 'confirm').mockReturnValue(true)

        await expect(confirmAction('¿Seguro?')).resolves.toBe(true)
        expect(native).toHaveBeenCalledWith('¿Seguro?')

        native.mockRestore()
    })
})
