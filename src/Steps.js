import { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FileInputApp from './FileInputApp';
import { CheckBox, Select, TextInput } from 'grommet';


const steps = [
  {
    id: 'Step1',
    label: 'Elige tus documentos',
    description: `Elige hasta un máximo de 10 archivos. Cada archivo representa una novela, 
                  si quieres subir multiples novelas debes utilizar el formato .zip. El nombre del archivo 
                  debe contener un identificador que indica el autor al que pertenece, ej. "nombreautor_nombrenovela.txt"`,
  },
  {
    id: 'Step2',
    label: 'Elige el tipo de N-grama',
    description: `Si eliges palabras el texto se queda sin modificación. 
                  Si eliges caracteres se tomará cada caracter alfanumerico de forma individual.
                  Si eliges etiquetas se utilizará un token para cada palabra`,
  },
  {
    id: 'Step3',
    label: 'Elige la longitud',
    description: `El tipo de N-grama indica el valor de N que representa a los
                  elementos de una secuencia dada.
                  Podemos encontrar un análisis mas detallado en el siguiente enlace:
                  https://es.wikipedia.org/wiki/N-grama`,
  },
  {
    id: 'Step4',
    label: 'Elige la frecuencia',
    description: `Es el número máximo aceptado de repeticiones de una palabra
    para tomar como referencia en el cálculo de las muestras de cada archivo`,
  },
  {
    id: 'Step5',
    label: '¿Quieres eliminar stopwords?',
    description: `Son algunas palabras extremadamente comunes que parecen ser 
                  de poco valor para ayudar a seleccionar documentos que coincidan 
                  con las necesidades del usuario están completamente excluidas del vocabulario.`,
  },
];

const Steps = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [fileList, setFileList] = useState(null);
  const [ngramType, setNgramType] = useState('palabras');
  const [ngramLength, setNgramLength] = useState('unigrama');
  const [ngramFrequency, setNgramFrequency] = useState(0);
  const [checked, setChecked] = useState(false);

  const handleFileList = ( files ) => {
    setFileList(files)
    console.log("Entró a setFileList")
  }

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // }

  const handleProcessClick = () => {
    setActiveStep(0)
    setNgramType('palabras')
    setNgramLength('bigrama')
    setNgramFrequency(0)

    if (!fileList) {
      return;
    }

    // Agregar los parámetros de procesamiento y después 
    // agregamos los archivos que se envian

    const data = new FormData();

    // Agregamos la configuración del proceso de generación.
  
    let ngram_type = ''
    switch (ngramType){
      case 'palabras': ngram_type = 'words';
        break;
      case 'caracteres': ngram_type = 'char';
        break;
      case 'etiquetas': ngram_type = 'pos';
        break;
      default: ngram_type = 'words';
    } 

    let ngram_length = 2
    switch (ngramLength){
      case 'unigrama': ngram_length = 1;
        break;
      case 'bigrama': ngram_length = 2;
        break;
      case 'trigrama': ngram_length = 3;
        break;
      case '4-grama': ngram_length = 4;
        break;
      case '5-grama': ngram_length = 5;
        break;
      default: ngram_length = 1;
    } 

    data.append('ngram_type', ngram_type);
    data.append('ngram_length', ngram_length);
    data.append('ngram_frequency', 10);
    data.append('delete_stopwords', checked);
    data.append('user_name', 'john@example.com');

    files.forEach((file, i) => {
      data.append(`file-${i}`, file, file.name);
    });

    fetch('http://127.0.0.1:5000/api/v1/process_ngrams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'no-cors',
      body: data,
    }).then((res) => console.log(res))
      .then((data) => console.log(data))
      .catch((err) => console.error(err));

  };

  const files = fileList ? [...fileList] : [];

  return (
    <Box sx={{ maxWidth: 800 }}>
      <Stepper activeStep={activeStep} orientation='vertical'>
        {steps.map((step, index) => (
          <Step key={step.id}>
            <StepLabel color='green'
              optional={
                index === 3 ? (<Typography variant="caption">Último paso</Typography>) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              {index === 0 ? <FileInputApp setFileList={handleFileList}/> : null}
              {index === 1 ?
                <Select
                  options={['palabras', 'caracteres', 'etiquetas']}
                  value={ngramType}
                  onChange={({ option }) => setNgramType(option)}
                /> : null}
              {index === 2 ?
                  <Select
                    options={['unigrama', 'bigrama', 'trigrama', '4-grama', '5-grama']}
                    value={ngramLength}
                    onChange={({ option }) => setNgramLength(option)}
                  /> : null}
              {index === 3 ?
                  <TextInput
                    placeholder="Escribe aquí"
                    value={ngramFrequency}
                    onChange={event => setNgramFrequency(event.target.value)}
                  />: null}
              {index === 4 ?
                  <CheckBox
                    checked={checked}
                    label="eliminar?"
                    onChange={event => setChecked(event.target.checked)}
                  />: null}
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Finalizar' : 'Continuar'}
                  </Button>
                  {/* <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Atrás
                  </Button> */}
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography color={'green'}>OK!</Typography>
          <Button onClick={handleProcessClick} sx={{ mt: 1, mr: 1, color: "white", backgroundColor: "blue" }}>
            Procesar
          </Button>
        </Paper>
      )}
    </Box>
  );
}

export default Steps;
