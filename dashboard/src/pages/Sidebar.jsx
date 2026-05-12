import './Sidebar.css';
import { NavLink } from 'react-router-dom';
 
function Sidebar() {
  return (
    <div className="sidebar">
      <h2>SIS</h2>
      <ul>
        <li><NavLink to="/" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Home</NavLink></li>
        <li><NavLink to="/AddStudent" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Add Students</NavLink></li>
        <li><NavLink to="/users" className={({isActive}) => isActive ? 'nav-link active' : 'nav-link'}>Users</NavLink></li>
      </ul>
    </div>
  );
}
 
export default Sidebar;


