/**
 * innoboxrr-form-core
 *
 * Lo que comparten los paquetes de interfaz innoboxrr —los componentes de Vue
 * y de React y los dos datatables— y no depende de ningun framework: el tema,
 * los iconos, los avisos y confirmaciones, la validacion de archivos y la lista
 * de zonas horarias.
 *
 * Estaba duplicado en los paquetes, que es exactamente como dos copias
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
    defaultIcons,
    getIcon,
    iconFor,
    onIconChange,
    resetIcons,
    setIcons,
} from './src/icons.js'

export {
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
} from './src/feedback.js'

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
