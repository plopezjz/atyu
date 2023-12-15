import { Header, Text } from "grommet";

const HeaderApp = () => {
  return(
    <div className="Header">
      <Header align="center" direction="row" flex={false} justify="between" gap="medium">
        <Text weight="bold">
          Análisis de texto utilizando N-gramas
        </Text>
      </Header>
    </div>
  );
}

export default HeaderApp;