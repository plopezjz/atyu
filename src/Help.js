import { Box, Image, Paragraph } from "grommet";

const Help = () => {
  return (
    <div className="help">
      <Box>
        <h3>Para poder utilizar la herramienta se permiten dos tipos de archivos:</h3>
        <br />
        <br />
        <Paragraph>
          1.- Si tus documentos son .TXT se pueden subir hasta un maximo de 10 archivos. <br /><br />
        </Paragraph>
        <Paragraph>
          2.- Si tus documentos son mas de 10 tienes que usar la siguiente estructura de archivos. <br /><br />
            * Carpeta con el nombre del dataset<br />
            * Carpeta con nombre del autor<br />
            * Archivo con nombre de la novela
            <br />
            <br />
            <br />
          <Image align="center"
            fit="cover"
            src="/assets/zip_file_help.png"
          />
        </Paragraph>
      </Box>
    </div>
  );
}

export default Help;