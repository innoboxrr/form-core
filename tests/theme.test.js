import { afterEach, describe, expect, it, vi } from 'vitest'
import { classFor, defaultTheme, getTheme, onThemeChange, resetTheme, setTheme } from '../src/theme.js'

afterEach(() => resetTheme())

describe('tema', () => {
    it('arranca con los valores de fabrica', () => {
        expect(getTheme('input')).toBe(defaultTheme.input)
        expect(getTheme()).toEqual(defaultTheme)
    })

    it('se ajusta por partes, sin repetir los demas tokens', () => {
        setTheme({ input: 'form-control' })

        expect(getTheme('input')).toBe('form-control')
        expect(getTheme('button')).toBe(defaultTheme.button)
    })

    it('un token que no existe es cadena vacia y no undefined', () => {
        expect(getTheme('inventado')).toBe('')
    })

    it('vuelve a fabrica', () => {
        setTheme({ input: 'x' })
        resetTheme()

        expect(getTheme('input')).toBe(defaultTheme.input)
    })

    it('avisa a quien escuche', () => {
        const listener = vi.fn()
        const stop = onThemeChange(listener)

        setTheme({ input: 'x' })

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ input: 'x' }))

        stop()
        setTheme({ input: 'y' })

        expect(listener).toHaveBeenCalledTimes(1)
    })
})

describe('classFor', () => {
    it('usa el token cuando no llega customClass', () => {
        expect(classFor('input')).toBe(defaultTheme.input)
        expect(classFor('input', null)).toBe(defaultTheme.input)
        expect(classFor('input', undefined)).toBe(defaultTheme.input)
    })

    /**
     * customClass manda para el caso puntual; el token da el aspecto de todo
     * el proyecto.
     */
    it('customClass manda cuando llega', () => {
        expect(classFor('input', 'mio')).toBe('mio')
    })

    /**
     * Cadena vacia es una decision: "sin clases". Si se tratara como ausente,
     * no habria forma de quitarle las clases a un control.
     */
    it('la cadena vacia quita las clases', () => {
        expect(classFor('input', '')).toBe('')
    })
})
