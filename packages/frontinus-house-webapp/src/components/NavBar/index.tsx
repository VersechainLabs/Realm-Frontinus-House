import { Navbar, Nav, Container } from 'react-bootstrap';
import {Link, useLocation, useNavigate} from 'react-router-dom';
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
import {getSlug, nameToSlug} from "../../utils/communitySlugs";
import {setActiveCommunity} from "../../state/slices/propHouse";

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
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [failedLoadingCommunity, setFailedLoadingCommunity] = useState(false);
  const location = useLocation();
  const slug = getSlug(location.pathname);
  const goCommunity = '/' + slug;
  useEffect(() => {
    backendClient.current = new ApiWrapper(backendHost, walletClient);
  }, [walletClient, backendHost]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoadingCommunity(true);
        const community = await backendClient.current.getCommunityWithName(slug);
        dispatch(setActiveCommunity(community));
        setLoadingCommunity(false);
      } catch (e) {
        setLoadingCommunity(false);
        setFailedLoadingCommunity(true);
      }
    };
    fetchCommunity();
  }, [slug, dispatch]);

  useEffect(() => {
    if(account && community){
      fetch();
    } else {
      dispatch(setUserType({
        type : '',
        address : ''
      }));
    }


  }, [ account,community]);

  const fetch = async ( ) => {
    try {
      const type = (await backendClient.current.getUserType(
          account,community.id
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
            <Link to={goCommunity} className={classes.logoGroup}>
              <img className={classes.bulbImg} src={community && community.icon} alt="bulb" />
              <Navbar.Brand>
                {(
                    <>
                      <div className={clsx('frontinusTitle', classes.navbarBrand)}>{community && community.name} House</div>
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
                  <Link to="/fh-charter" className={classes.link}>
                    {t('fhCharter')}
                  {/*<a target="_blank" href="https://github.com/Calcutatator/Frontinus-House-Docs/blob/main/Charter/Charter.md" className={classes.link}>{t('fhCharter')}</a>*/}
                  </Link>
                  {/*<span className={classes.divider}></span>*/}
                </Nav.Link>


                <div className={classes.buttonGroup}>
                  {/*<LocaleSwitcher setIsNavExpanded={setIsNavExpanded} />*/}
                  {
                    userType === 'Admin' && community && <Nav.Link as="div" className={classes.connectBtnContainer}>
                      <Button
                          text="Create a Delegation Round"
                          bgColor={ButtonColor.Purple}
                          onClick={() => navigate('/'+ nameToSlug(community.name) + '/create-delegate-form')}
                          classNames={classes.createRoundBtn}
                      />
                    </Nav.Link>
                  }

                  {account && community && (
                      <Nav.Link as="div" className={classes.connectBtnContainer}>
                        <Button
                            text="Create a Proposal Round"
                            bgColor={ButtonColor.Purple}
                            onClick={() => navigate('/'+ nameToSlug(community.name) + '/create-round-form')}
                            classNames={classes.createRoundBtn}
                        />
                      </Nav.Link>
                  )
                  }
                  <Nav.Link as="div" className={clsx(classes.menuLink,classes.menuLink1)} onClick={() => setIsNavExpanded(false)}>
                    <Link to="/" className={clsx(classes.link,classes.link1)}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.176 10.8659L4.756 10.4804L5.176 10.8664V10.8659ZM4 12.4091V18.2916H5.14286V12.4091H4ZM18.2857 18.8611H5.71429V20H18.2857V18.8611ZM18.8571 12.4091V18.2916H20V12.4091H18.8571ZM19.244 10.4804L14.1011 4.91787L13.2611 5.68949L18.404 11.252L19.244 10.4804ZM9.89886 4.91787L4.756 10.4804L5.596 11.252L10.7389 5.68949L9.89886 4.91787ZM14.1011 4.91787C13.8336 4.62849 13.5087 4.39753 13.1471 4.23954C12.7854 4.08156 12.3949 4 12 4C11.6051 4 11.2146 4.08156 10.8529 4.23954C10.4913 4.39753 10.1664 4.62849 9.89886 4.91787L10.7389 5.68949C10.8994 5.51581 11.0943 5.37718 11.3114 5.28236C11.5284 5.18754 11.7628 5.13858 11.9997 5.13858C12.2367 5.13858 12.4711 5.18754 12.6881 5.28236C12.9051 5.37718 13.1 5.51581 13.2606 5.68949L14.1011 4.91787ZM20 12.4097C20 11.6948 19.7301 11.0061 19.244 10.4804L18.404 11.252C18.6955 11.5675 18.8573 11.9808 18.8571 12.4097H20ZM5.14286 12.4097C5.14287 11.9807 5.30484 11.5674 5.59657 11.252L4.756 10.4804C4.27003 11.0059 4.00017 11.6944 4 12.4091H5.14286V12.4097ZM4 18.2916C4 18.7447 4.18061 19.1792 4.5021 19.4996C4.82359 19.82 5.25963 20 5.71429 20V18.8611C5.56273 18.8611 5.41739 18.8011 5.31022 18.6943C5.20306 18.5875 5.14286 18.4427 5.14286 18.2916H4ZM18.2857 20C18.7404 20 19.1764 19.82 19.4979 19.4996C19.8194 19.1792 20 18.7447 20 18.2916H18.8571C18.8571 18.4427 18.7969 18.5875 18.6898 18.6943C18.5826 18.8011 18.4373 18.8611 18.2857 18.8611V20ZM9.14286 13.7359V18.8611H10.2857V13.7359H9.14286ZM13.7143 18.8611H10.2857V20H13.7143V18.8611ZM13.7143 13.7359V18.8611H14.8571V13.7359H13.7143ZM13.7143 12.597H10.2857V13.7359H13.7143V12.597ZM14.8571 13.7359C14.8571 13.4339 14.7367 13.1442 14.5224 12.9306C14.3081 12.717 14.0174 12.597 13.7143 12.597V13.7359H14.8571ZM10.2857 13.7359V12.597C9.98261 12.597 9.69192 12.717 9.47759 12.9306C9.26327 13.1442 9.14286 13.4339 9.14286 13.7359H10.2857ZM9.14286 18.8611C9.14286 19.1631 9.26327 19.4528 9.47759 19.6664C9.69192 19.88 9.98261 20 10.2857 20V18.8611H9.14286ZM13.7143 20C14.0174 20 14.3081 19.88 14.5224 19.6664C14.7367 19.4528 14.8571 19.1631 14.8571 18.8611H13.7143V20Z" fill="white"/>
                      </svg>

                    </Link>
                    {/*<span className={classes.divider}></span>*/}
                  </Nav.Link>

                  <Nav.Link as="div" className={classes.connectBtnContainer}>
                    <ConnectButton chainStatus={'icon'} showBalance={false} label={t('connect')} />
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
