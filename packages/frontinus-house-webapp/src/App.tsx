import { Routes, Route, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../src/css/globals.css';
import React, { Suspense, useEffect, useState } from 'react';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Create from './pages/Create';
import ApplicationCreate from './pages/ApplicationCreate';
import House from './pages/House';
import Footer from './components/Footer';
import './App.css';
import FAQ from './pages/FAQ';
import LoadingIndicator from './components/LoadingIndicator';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import NotFound from './components/NotFound';
import Round from './pages/Round';
import DelegateDetails from './pages/DelegateDetails';
import bgColorForPage from './utils/bgColorForPage';
import clsx from 'clsx';
import OpenGraphHouseCard from './components/OpenGraphHouseCard';
import OpenGraphRoundCard from './components/OpenGraphRoundCard';
import OpenGraphProposalCard from './components/OpenGraphProposalCard';
import Proposal from './pages/Proposal';
import { createClient, mainnet, configureChains, WagmiConfig } from 'wagmi';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import {
  AvatarComponent,
  connectorsForWallets, darkTheme,
  getDefaultWallets,
  lightTheme,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import StatusRoundCards from './components/StatusRoundCards';
import CreateRound from './pages/CreateRound';
import CreateRoundForm from './pages/CreateRoundForm';
import CreateDelegateForm from './pages/CreateDelegateForm';
import CommentsPage from './pages/CommentsPage';
import { injectedWallet, metaMaskWallet, rainbowWallet } from '@rainbow-me/rainbowkit/wallets';
import AddressAvatar from './components/AddressAvatar';
import classes from './components/AddressAvatar/AddressAvatar.module.css';
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import {useAppDispatch, useAppSelector} from "./hooks";
import {
  clearClick
} from './state/slices/alert';

const { chains, provider } = configureChains(
  [mainnet],
  [infuraProvider({ apiKey: process.env.REACT_APP_INFURA_PROJECT_ID! }), publicProvider()],
);

// const { connectors } = getDefaultWallets({
//   appName: 'Frontinus House',
//   chains,
// });

const connectors = connectorsForWallets([
  {
    groupName: 'Recommended',
    wallets: [
      injectedWallet({ chains }),
      rainbowWallet({ chains }),
      metaMaskWallet({ chains }),
    ],
  },
]);


const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});


localStorage.setItem('devEnv', 'development');

function App() {
  const location = useLocation();
  const [noActiveCommunity, setNoActiveCommunity] = useState(false);

  const [open, setOpen] = React.useState(false);

  const alert = useAppSelector(state => state.alert);
  const alertClick = useAppSelector(state => state.alert.click);
  const dispatch = useAppDispatch();

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  useEffect(() => {

    if(alertClick){
      setOpen(true);
      dispatch(clearClick);
    }

    setTimeout(() => {
      setOpen(false);
    }, 2000);

  }, [alertClick]);

  useEffect(() => {
    setNoActiveCommunity(false);

    if (!location.state) {
      setNoActiveCommunity(true);
    }
  }, [noActiveCommunity, location.state]);

  const openGraphCardPath = new RegExp('.+?/card').test(location.pathname);
  const noNavPath =
    location.pathname === '/' || location.pathname === '/faq' || location.pathname === '/create';

  const CustomAvatar: AvatarComponent = ({ address, ensImage, size }) => {
    return (
      <div style={{ display: 'flex' }}>
        {ensImage ? (
          <img
            style={{ height: size, width: size }}
            className={clsx(!ensImage && classes.glasses)}
            src={ensImage!}
            alt='avatar'
          />
        ) : (
          <Jazzicon diameter={size} seed={jsNumberForAddress(address)} />
        )
        }
      </div>
    );
  };
  return (
    <>
      <WagmiConfig client={wagmiClient}>
        {openGraphCardPath ? (
          <Routes>
            <Route path="/proposal/:id/card" element={<OpenGraphProposalCard />} />
            <Route path="/round/:id/card" element={<OpenGraphRoundCard />} />
            <Route path="/house/:id/card" element={<OpenGraphHouseCard />} />
          </Routes>
        ) : (
          <RainbowKitProvider
            chains={chains}
            theme={darkTheme({
              accentColor: 'var(--brand-purple)',
            })}
            avatar={CustomAvatar}
          >
            <Suspense fallback={<LoadingIndicator />}>
              <div className={clsx(bgColorForPage(location.pathname), 'wrapper')}>
                {/*{!noNavPath && <NavBar />}*/}
                {<NavBar />}

                <Routes>
                  <Route path="/rounds" element={<StatusRoundCards />} />
                  <Route path="/" element={<House />} />
                  <Route
                    path="/create"
                    element={
                      <ProtectedRoute noActiveCommunity={noActiveCommunity}>
                        <Create />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="application/create"
                    element={ <ApplicationCreate /> }
                  />
                  <Route path="/create-round" element={<CreateRound />} />
                  <Route path="/create-round-form" element={<CreateRoundForm />} />
                  <Route path="/create-delegate-form" element={<CreateDelegateForm />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/proposal/:id" element={<Proposal />} />
                  <Route path="/delegateDetails/:id" element={<DelegateDetails />} />
                  {/*<Route path="/:house" element={<House />} />*/}
                  {/*<Route path="/:title" element={<Round />} />*/}
                  <Route path="/:title/:id" element={<Round />} />
                  <Route path="/comment/:proposalId" element={<CommentsPage />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>

                <Footer />
              </div>
            </Suspense>
          </RainbowKitProvider>
        )}

        <Snackbar
            anchorOrigin={{
              vertical: 'top' ,
              horizontal:'center'
            }}
            open={open} autoHideDuration={2000} onClose={handleClose}>
          <Alert severity={alert.type}>{alert.message}</Alert>
         </Snackbar>

      </WagmiConfig>
    </>
  );
}

export default App;
