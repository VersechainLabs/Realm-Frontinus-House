import NoActiveHouseModal from '../NoActiveHouseModal';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { useLocation, useNavigate } from 'react-router-dom';
import { setAlert } from '../../state/slices/alert';

interface ProtectedRouteProps {
  noActiveCommunity: boolean;
  children: JSX.Element;
}

const ProtectedRoute = ({ noActiveCommunity, children }: ProtectedRouteProps) => {
  if (noActiveCommunity) return <NoActiveHouseModal />;

  return children;
};

export default ProtectedRoute;
