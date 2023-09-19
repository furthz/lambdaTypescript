import * as fs from 'fs'


const readFileStats = async (filePath: string, timeEvaluate: number): Promise<void> => {
    const stat = fs.statSync(filePath);
    console.log(`archivo: ${filePath}, estadisticas: ${JSON.stringify(stat, null, 2)}`)

    const diff = Date.now() - stat.atimeMs;
    console.log(`Diferencia: ${diff}`)
    if (diff >= timeEvaluate) {
        fs.unlinkSync(filePath);
        console.log(`archivo eliminado: ${filePath}`)
    }
}

export const readDirectory = async (directoryPath: string, timeEvaluate: number): Promise<void> => {

    if (directoryPath == null) {
        throw new Error(`El path a analizar está vacío`);
    }

    try {
        console.log('revisar los archivos de:' + directoryPath)

        let filesNames = fs.readdirSync(directoryPath)
        console.log(`Archivos a analizar: ${filesNames}`)

        for (const file of filesNames) {
            const name = `${directoryPath}/${file}`;
            console.log(`Archivo a evaluar: ${name}`)

            if (fs.statSync(name).isDirectory()) {
                readDirectory(name, timeEvaluate);
            } else {
                readFileStats(name, timeEvaluate);
            }
        }


    } catch (e) {
        console.error(`${JSON.stringify(e)}`)
    }
}