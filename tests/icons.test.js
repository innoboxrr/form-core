import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultIcons, getIcon, iconFor, onIconChange, resetIcons, setIcons } from '../src/icons.js'

afterEach(() => resetIcons())

describe('mapa de iconos', () => {
    it('arranca con los valores de fabrica', () => {
        expect(getIcon('plus')).toBe(defaultIcons.plus)
        expect(getIcon()).toEqual(defaultIcons)
    })

    it('se ajusta por partes, sin repetir los demas', () => {
        setIcons({ plus: 'lucide:plus' })

        expect(getIcon('plus')).toBe('lucide:plus')
        expect(getIcon('download')).toBe(defaultIcons.download)
    })

    it('un nombre que no existe es cadena vacia y no undefined', () => {
        expect(getIcon('inventado')).toBe('')
    })

    it('avisa a quien escuche', () => {
        const listener = vi.fn()
        const stop = onIconChange(listener)

        setIcons({ plus: 'x' })

        expect(listener).toHaveBeenCalledWith(expect.objectContaining({ plus: 'x' }))

        stop()
        setIcons({ plus: 'y' })

        expect(listener).toHaveBeenCalledTimes(1)
    })
})

describe('iconFor', () => {
    it('traduce un nombre semantico', () => {
        expect(iconFor('plus')).toBe(defaultIcons.plus)
    })

    /**
     * El mapa es para lo que se repite, no una aduana: un icono suelto se
     * pasa entero y funciona sin tener que darlo de alta.
     */
    it('deja pasar un nombre de Iconify tal cual', () => {
        expect(iconFor('mdi:home')).toBe('mdi:home')
        expect(iconFor('material-symbols:rocket-launch')).toBe('material-symbols:rocket-launch')
    })

    it('el mapa manda sobre la coleccion por defecto', () => {
        setIcons({ plus: 'tabler:plus' })

        expect(iconFor('plus')).toBe('tabler:plus')
    })

    it('un nombre desconocido se devuelve tal cual, para que el fallo se vea', () => {
        expect(iconFor('no-existe')).toBe('no-existe')
    })

    it('vacio, null y undefined dan cadena vacia', () => {
        expect(iconFor('')).toBe('')
        expect(iconFor(null)).toBe('')
        expect(iconFor(undefined)).toBe('')
    })
})

describe('el mapa cubre lo que el ecosistema usa', () => {
    /**
     * Estos son los nombres que pasa el codigo generado por larapack y los
     * datatables. Si alguno desaparece del mapa, ese icono deja de pintarse y
     * no lo dice nadie.
     */
    it('tiene los iconos que pide el CRUD generado', () => {
        for (const name of ['plus', 'download', 'actions', 'edit', 'delete', 'show', 'refresh', 'search', 'help', 'box', 'locked']) {
            expect(iconFor(name), `falta el icono \`${name}\``).toMatch(/^[a-z0-9-]+:[a-z0-9-]+$/)
        }
    })

    it('ningun valor por defecto apunta a UIkit ni a una clase de Font Awesome', () => {
        const sospechosos = Object.entries(defaultIcons).filter(
            ([, value]) => value.startsWith('uk-') || value.startsWith('fa-') || ! value.includes(':')
        )

        expect(sospechosos).toEqual([])
    })
})
