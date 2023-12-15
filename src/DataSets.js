import { Box, List, Paragraph } from 'grommet';
import { Link } from 'react-router-dom'

const DataSets = () => {


  return (
    <div className="datasets">
      <Box pad="large">
        <Paragraph alignSelf='center' margin="medium">
          Explora, analiza y comparte estos Datasets
        </Paragraph>
        <Paragraph alignSelf='center'>
          <List
            primaryKey="name"
            secondaryKey="percent"
            data={[
              { name: 'C50 Dataset', percent:  <Link to="/datasets/c50.zip" target="_blank" download>descargar</Link>},
              { name: 'PAN2012 Dataset', percent: <Link to="/datasets/Novelas.zip" target="_blank" download>descargar</Link> },
            ]}
          />
        </Paragraph>
      </Box>
    </div>
  );
}

export default DataSets;