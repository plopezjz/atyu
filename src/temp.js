import React, { Component } from 'react'
import { Grommet, Page, PageContent, Header, Text, Menu, Button, PageHeader, Grid, Select, Card, CardHeader, CardBody, Stack, TextInput, FileInput, Paragraph, Markdown} from 'grommet'
import { User } from 'grommet-icons'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
};

const labels = ['al', 'cosa', 'quijote', 'cacahuate', 'caballo', 'el'];
const amounts = [21, 41, 34, 17, 56, 12];

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: amounts,
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
    },
  ],
};

class App extends Component {
  state = {
    selectetFile: null,
    fileUploadedSuccessfully: false
  }

  chartData = () => {
    if (this.state.selectetFile){
      const reader = new FileReader();
      reader.addEventListener(
        "load",
        () => {
          let text = reader.result;
          let words = [];
          text = text.replace(/[\r\n]+/g," ");
          text = text.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
          words = text.split(" ");
          let freqMap = {};
          words.forEach(function(w) {
              if (w === '')
                return;
              
              if (!freqMap[w]) {
                  freqMap[w] = 0;
              }
              freqMap[w] += 1;
          });

        },
        false,
      );
      reader.readAsText(this.state.selectetFile);
      // Datos dummy
      
      return(
        <Bar options={options} data={data} />
      );
    }
  }

  onFileChange = event => {
    if(event.target.files[0]){
      const reader = new FileReader();
      const contentParagraft = document.querySelector(".content");
      const numberOfWords = document.querySelector(".number-of-words");
      reader.addEventListener(
        "load",
        () => {
          let text = reader.result;
          let nWords = 0;
          text = text.replace(/[\r\n]+/g," ");
          text = text.replace(/[^a-zA-Z0-9 ]/g, " ").trim();
          nWords = text.split(" ").length;
          contentParagraft.innerText =  text;
          numberOfWords.innerText = nWords;
          this.setState({ fileUploadedSuccessfully: true });
        },
        false,
      );
      reader.readAsText(event.target.files[0]);
    }

    this.setState({ selectetFile: event.target.files[0] });
  }

  onFileUpload = () => {
    const formData = new FormData();
    formData.append(
      "demo file",
      this.state.selectetFile,
      this.state.selectetFile.name
    );

    // Llamar a la api 
    //console.log(formData)
    this.setState({ selectetFile: null });
    this.setState({ fileUploadedSuccessfully: true })
  }

  fileData = () => {
    if (this.state.selectetFile) {
      return (
        <div>
          <h2>Detalles del archivo: </h2>
          <p>Nombre: {this.state.selectetFile.name}</p>
          <p>Tamaño: {this.state.selectetFile.size}</p>
          <p>Tipo: {this.state.selectetFile.type}</p>
        </div>
      );
    } else if (this.state.fileUploadedSuccessfully) {
      return (
        <h4>Su archivo fue cargado correctamente</h4>
      );
    } else {
      return (
        <div>
          <Markdown>Elige un arhivo y presiona el botón  **procesar documento**</Markdown>
        </div>
      );
    }
  }

  render() {
    return (
      <Grommet>
        <Page>
          <PageContent border={{ "side": "bottom" }}>
            <Header align="center" direction="row" flex={false} justify="between" gap="medium">
              <Text weight="bold">
                Análisis de texto para atribución de autoría
              </Text>
              <Menu icon={<User />} items={[{ "label": "sign out" }]} />
            </Header>
          </PageContent>
          <PageContent margin={{ "vertical": "medium" }}>
            <PageHeader margin={{ "vertical": "medium" }} title="Analiza la autoría de tus documentos" alignSelf="center" />
            <Grid columns="small" gap="medium">
              <Card align="center">
                <CardHeader align="center" direction="row" flex={false} justify="between" gap="medium" pad="small">
                  <Text weight="bold" size="medium" textAlign="center">
                    Selecciona un documento
                  </Text>
                </CardHeader>
                <CardBody pad="small">
                  <Stack anchor="center">
                    <FileInput
                      name="file"
                      onChange={this.onFileChange}
                    />
                  </Stack>
                </CardBody>
              </Card>
              <Card align='center'>
                <CardHeader align="center" direction="row" flex={false} justify="between" gap="medium" pad="small">
                  <Text weight="bold" size="medium" textAlign="center">Elige el tipo de N-Grama</Text>
                </CardHeader>
                <CardBody pad="small">
                  <Stack archor="center">
                    <Select
                      options={['palabras', 'caracteres']}
                      value={'palabras'}
                      onChange={({ option }) => (option)}
                    />
                  </Stack>
                </CardBody>
              </Card>
              <Card align='center'>
                <CardHeader align="center" direction="row" flex={false} justify="between" gap="medium" pad="small">
                  <Text weight="bold" size="medium" textAlign="center">Elige la longitud del N-Grama</Text>
                </CardHeader>
                <CardBody pad="small">
                  <Stack archor="center">
                    <Select
                      options={['unigrama', 'bigrama', 'trigrama', '4-grama', '5-grama']}
                      value={'unigrama'}
                      onChange={({ option }) => (option)}
                    />
                  </Stack>
                </CardBody>
              </Card>
              <Card align='center'>
                <CardHeader align="center" direction="row" flex={false} justify="between" gap="medium" pad="small">
                  <Text weight="bold" size="medium" textAlign="center">Umbral de frecuencia</Text>
                </CardHeader>
                <CardBody pad="small">
                  <Stack archor="center">
                    <TextInput
                      placeholder="Escribe aquí"
                      value={"10"}
                      onChange={()=>{}}
                    />
                  </Stack>
                </CardBody>
              </Card>
            </Grid>
          </PageContent>
          <PageContent border={{ "side": "bottom" }}>
            <Button primary size='medium' margin = {{horizontal: "xlarge"}} label="Procesar documento" onClick={this.onFileUpload} />
          </PageContent>
          <PageContent border={{ "side": "bottom" }} align='center'> 
            {this.fileData()}
            {this.chartData()}
            <h3>Número de palabras: </h3><Paragraph className='number-of-words'> 0 </Paragraph>
            <h3>Contenido: </h3><Paragraph className='content'> . </Paragraph>
          </PageContent>
        </Page>
      </Grommet>
    )
  }
}

export default App;
