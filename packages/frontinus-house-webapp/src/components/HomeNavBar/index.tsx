import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import classes from './HomeNavBar.module.css';
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
import {nameToSlug} from "../../utils/communitySlugs";

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
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);


  useEffect(() => {
    if(account){
      fetch();
    } else {
      dispatch(setUserType({
        type : '',
        address : ''
      }));
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
      <div className={'bgTop'}>
        <Container >
          <Navbar bg="transparent" expand="lg" className={classes.navbar} expanded={isNavExpanded}>
            <Link to="/" className={classes.logoGroup}>
              <img className={classes.bulbImg} src="/logo.png" alt="bulb" />
              <Navbar.Brand>
                {(
                    <>
                      <div className={clsx('frontinusTitle', classes.navbarBrand)}>Place holder</div>
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
                  {/*<Link to="/fh-charter" className={classes.link}>*/}
                  {/*  {t('fhCharter')}*/}
                  {/*/!*<a target="_blank" href="https://github.com/Calcutatator/Frontinus-House-Docs/blob/main/Charter/Charter.md" className={classes.link}>{t('fhCharter')}</a>*!/*/}
                  {/*</Link> */}
                  <Link to="/" className={classes.link}>
                    FAQ
                  {/*<a target="_blank" href="https://github.com/Calcutatator/Frontinus-House-Docs/blob/main/Charter/Charter.md" className={classes.link}>{t('fhCharter')}</a>*/}
                  </Link>
                  {/*<span className={classes.divider}></span>*/}
                </Nav.Link>

                <div className={classes.buttonGroup}>
                  {/*<LocaleSwitcher setIsNavExpanded={setIsNavExpanded} />*/}
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
      </div>

  );
};

export default NavBar;
