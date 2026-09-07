/**
 * innoboxrr-form-core
 *
 * Lo que comparten innoboxrr-form-elements y innoboxrr-react-form-elements y
 * no depende de ningun framework: el tema, la validacion de archivos y la
 * lista de zonas horarias.
 *
 * Estaba duplicado en los dos paquetes, que es exactamente como dos copias
 * empiezan a divergir.
 */

export {
    classFor,
    defaultTheme,
    getTheme,
    onThemeChange,
    resetTheme,
    setTheme,
} from './src/theme.js'

export {
    FILE_ICON,
    describeFiles,
    errorsFor,
    isImage,
    isVideo,
    previewFor,
    sizeParser,
    validateFiles,
} from './src/files.js'

export { default as timezones } from './src/timezone.js'
