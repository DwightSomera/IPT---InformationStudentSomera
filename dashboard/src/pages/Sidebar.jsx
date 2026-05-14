import './Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
 
function Sidebar({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleSignOut = () => {
    // Clear stored auth and update app state so routes update client-side
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (typeof setIsAuthenticated === 'function') setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <h2>SIS</h2>
      <ul>
        <li><NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink></li>
        <li><NavLink to="/students" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Add Students</NavLink></li>
        <li><NavLink to="/users" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Users</NavLink></li>
      </ul>
      <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
        <Button variant="contained" color="error" fullWidth onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </div>
  );
}
 
export default Sidebar;


