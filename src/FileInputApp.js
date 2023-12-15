import { FileInput, Form, FormField } from 'grommet';

const FileInputApp = (props) => {

  const handleFileChange = (e, { files }) => {
    props.setFileList(files)
  };

  return(
    <Form onSubmit={({ value }) => console.log(value)}>
      <FormField label="#####################################" name="file-input" htmlFor="file-input">
        <FileInput
          name="file-input"
          id="file-input"
          onChange={handleFileChange}
          messages={
            {
              browse: "Explore", 
              dropPrompt: "Suelte sus archivos aquí o ", 
              dropPromptMultiple: "Suelte sus archivos aquí o", 
              files: "archivos", 
              remove: "eliminar", 
              removeAll: "eliminar todos",
              maxFile: "Adjunte un maximo de 10 archivos"
            }
          }
          multiple={{
            max: 10,
          }}
        />
      </FormField>
    </Form>
  );
}

export default FileInputApp;
