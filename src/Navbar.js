import { Nav, Anchor } from 'grommet'
import { Help, Home, Test } from 'grommet-icons'
import HeaderApp from './HeaderApp';

const Navbar = () => {
  return (
    <div className="Navbar">
      <Nav direction="row" background="brand" pad="medium" align='center'>
        <Anchor href='/'  icon={<Home />} hoverIndicator />
        <Anchor href='/datasets'  icon={<Test />} hoverIndicator />
        <Anchor href='/help'  icon={<Help />} hoverIndicator />
        <HeaderApp></HeaderApp>
      </Nav>
    </div>
  );
}

export default Navbar;