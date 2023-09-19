import { readDirectory } from "./src/efs";
import { Handler } from 'aws-lambda'
const DAYS_TO_REMOVE = process.env.DAYS_TO_REMOVE;
const PATH_FS = process.env.PATH_FS;

const main = async () => {
    // Obtener el tiempo transcurrido para eliminar ficheros
    if (+DAYS_TO_REMOVE! <= 0) {
        console.error('Error en la cantidad de días a eliminar')
    }

    if (!PATH_FS) {
        console.error('Error en el directorio compartido')
    }

    const timeToRemove = +DAYS_TO_REMOVE!; // * 24 * 60 * 60 * 1000;
    readDirectory(PATH_FS!, timeToRemove);
}

export const handler: Handler = async (event, context) => {
    main();

    return "Files Procesados"
}

