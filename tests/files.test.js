import { describe, expect, it } from 'vitest'
import {
    FILE_ICON,
    describeFiles,
    errorsFor,
    isImage,
    isVideo,
    previewFor,
    sizeParser,
    validateFiles,
} from '../src/files.js'

const file = (name, type, size = 1024) => {
    const blob = new File(['x'], name, { type })

    Object.defineProperty(blob, 'size', { value: size })

    return blob
}

const RULES = { maxSize: 2048, validMimes: ['image/png', 'application/pdf'] }

describe('describeFiles', () => {
    it('acepta lo que cumple mime y tamaño', () => {
        const [entry] = describeFiles([file('a.png', 'image/png')], RULES)

        expect(entry.validation).toBe(true)
        expect(entry.errors).toEqual([])
        expect(entry.uploaded).toBe(false)
        expect(entry.name).toBe('a.png')
        expect(entry.size).toBe(1024)
    })

    it('rechaza un mime que no esta en la lista', () => {
        const [entry] = describeFiles([file('a.exe', 'application/x-msdownload')], RULES)

        expect(entry.validation).toBe(false)
        expect(entry.errors).toContain('failMimeValidation')
    })

    it('rechaza lo que pasa del tamaño maximo', () => {
        const [entry] = describeFiles([file('a.png', 'image/png', 4096)], RULES)

        expect(entry.validation).toBe(false)
        expect(entry.errors).toContain('failMaxSizeValidation')
    })

    it('acumula los dos errores cuando fallan los dos', () => {
        const [entry] = describeFiles([file('a.exe', 'application/x-msdownload', 4096)], RULES)

        expect(entry.errors).toEqual(['failMimeValidation', 'failMaxSizeValidation'])
    })

    it('maxSize 0 significa sin limite', () => {
        const [entry] = describeFiles(
            [file('a.png', 'image/png', 999999)],
            { maxSize: 0, validMimes: ['image/png'] }
        )

        expect(entry.validation).toBe(true)
    })

    it('sin validMimes se acepta cualquier tipo', () => {
        const [entry] = describeFiles([file('a.exe', 'application/x-msdownload')], { maxSize: 0 })

        expect(entry.validation).toBe(true)
    })

    /**
     * La version anterior escribia las propiedades sobre el propio File. El
     * File es del navegador y no es sitio para campos inventados; ademas, asi
     * no se podia describir el mismo archivo dos veces con reglas distintas.
     */
    it('no toca el File original y lo deja a mano para el FormData', () => {
        const original = file('a.png', 'image/png')
        const [entry] = describeFiles([original], RULES)

        expect(entry.file).toBe(original)
        expect(original.validation).toBeUndefined()
        expect(original.preview).toBeUndefined()
    })

    it('describe el mismo archivo con reglas distintas sin contaminarse', () => {
        const original = file('a.png', 'image/png', 4096)

        const [flojo] = describeFiles([original], { maxSize: 0, validMimes: ['image/png'] })
        const [estricto] = describeFiles([original], RULES)

        expect(flojo.validation).toBe(true)
        expect(estricto.validation).toBe(false)
    })

    it('sin archivos devuelve una lista vacia', () => {
        expect(describeFiles()).toEqual([])
        expect(describeFiles(null)).toEqual([])
    })
})

describe('validateFiles', () => {
    it('sigue siendo una promesa, por compatibilidad', async () => {
        const [entry] = await validateFiles([file('a.png', 'image/png')], RULES)

        expect(entry.validation).toBe(true)
    })
})

describe('previewFor', () => {
    /**
     * URL.createObjectURL no existe en Node, ni en jsdom, ni en un render de
     * servidor: sin la guarda, describir una imagen fuera del navegador
     * lanzaba.
     */
    it('sin createObjectURL cae al icono en vez de lanzar', () => {
        const original = URL.createObjectURL

        delete URL.createObjectURL

        expect(previewFor(file('a.png', 'image/png'))).toBe(FILE_ICON)

        URL.createObjectURL = original
    })

    it('lo que no es imagen usa el icono, y el icono no sale a la red', () => {
        expect(previewFor(file('a.pdf', 'application/pdf'))).toBe(FILE_ICON)
        expect(FILE_ICON.startsWith('data:')).toBe(true)
    })
})

describe('isImage / isVideo', () => {
    it('distingue por el mime', () => {
        expect(isImage(file('a.png', 'image/png'))).toBe(true)
        expect(isImage(file('a.mp4', 'video/mp4'))).toBe(false)
        expect(isVideo(file('a.mp4', 'video/mp4'))).toBe(true)
        expect(isVideo(file('a.png', 'image/png'))).toBe(false)
        expect(isImage(null)).toBe(false)
    })
})

describe('errorsFor', () => {
    it('es la pieza suelta, por si alguien valida por su cuenta', () => {
        expect(errorsFor(file('a.png', 'image/png'), RULES)).toEqual([])
        expect(errorsFor(file('a.png', 'image/png', 9999), RULES)).toEqual(['failMaxSizeValidation'])
    })
})

describe('sizeParser', () => {
    it('pasa los bytes a algo legible', () => {
        expect(sizeParser(0)).toBe('0 Byte')
        expect(sizeParser(1024)).toBe('1 KB')
        expect(sizeParser(1048576)).toBe('1 MB')
        expect(sizeParser(1073741824)).toBe('1 GB')
    })

    /**
     * Con 5 PB el indice se salia del array y devolvia 'undefined'.
     */
    it('no se sale del array con tamaños absurdos', () => {
        expect(sizeParser(Math.pow(1024, 6))).toContain('TB')
    })
})
