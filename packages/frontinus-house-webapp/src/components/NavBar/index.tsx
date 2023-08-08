import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import classes from './NavBar.module.css';
import clsx from 'clsx';
import LocaleSwitcher from '../LocaleSwitcher';
import { useTranslation } from 'react-i18next';
import {useEffect, useRef, useState} from 'react';
import AdminTool from '../AdminTool';
import DevEnvDropDown from '../DevEnvDropdown';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { isMobile } from 'web3modal';
import Button, { ButtonColor } from '../Button';
import {useAccount, useWalletClient} from "wagmi";
import { ApiWrapper } from '@nouns/frontinus-house-wrapper';
import {useAppSelector} from "../../hooks";
import {useDispatch} from "react-redux";
import { setUserType } from "../../state/slices/user";

const NavBar = () => {
  const { t } = useTranslation();
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const navigate = useNavigate();

  const { data: walletClient } = useWalletClient();
  const {address: account} = useAccount();
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new ApiWrapper(backendHost, walletClient));
  const dispatch = useDispatch();

  const userType = useAppSelector(state => state.user.type);

  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);


  useEffect(() => {
    if(account){
      fetch();
    }
  }, [ account]);

  const fetch = async ( ) => {
    try {

      const type = (await backendClient.current.getUserType(
          account
      ));
      
      dispatch(setUserType({
        type : type,
        address : account
      }));

    } catch (e) {

    }
  };

  return (
    <Container>
      <Navbar bg="transparent" expand="lg" className={classes.navbar} expanded={isNavExpanded}>
        <Link to="/" className={classes.logoGroup}>
          <img className={classes.bulbImg} src="/bulb.png" alt="bulb" />
          <Navbar.Brand>
            {!isMobile() && (
              <>
                <div className={classes.navbarBrand}>{t('frontinusHouse')}</div>
              </>
            )}
          </Navbar.Brand>
        </Link>

        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className={clsx('ms-auto', classes.navBarCollapse)}>
            <Nav.Link as="div" className={classes.menuLink} onClick={() => setIsNavExpanded(false)}>
              <Link to="/faq" className={classes.link}>
                {t('faq')}
              </Link>
              <span className={classes.divider}></span>
            </Nav.Link>

            <div className={classes.buttonGroup}>
              {/*<LocaleSwitcher setIsNavExpanded={setIsNavExpanded} />*/}
              {
                userType === 'Admin' &&  <Nav.Link as="div" className={classes.connectBtnContainer}>
                  <Button
                      text="Create a Delegation Round"
                      bgColor={ButtonColor.Purple}
                      onClick={() => navigate('/create-delegate-form')}
                      classNames={classes.createRoundBtn}
                  />
                </Nav.Link>
              }


              <Nav.Link as="div" className={classes.connectBtnContainer}>
                <Button
                    text="Create a Proposal Round"
                    bgColor={ButtonColor.Purple}
                    onClick={() => navigate('/create-round-form')}
                    classNames={classes.createRoundBtn}
                />
              </Nav.Link>

              <Nav.Link as="div" className={classes.connectBtnContainer}>
                <ConnectButton showBalance={false} label={t('connect')} />
              </Nav.Link>

              {/*<AdminTool>*/}
              {/*  <DevEnvDropDown />*/}
              {/*</AdminTool>*/}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </Container>
  );
};

export default NavBar;
