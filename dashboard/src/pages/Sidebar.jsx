import './Sidebar.css';
import { Link } from 'react-router-dom';
 
function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Navigation Menu</h2>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/AddStudent">Add Students</Link></li>
        <li><Link to="/Car">Car</Link></li>
        <li><Link to="/users">Users</Link></li>
      </ul>
    </div>
  );
}
 
export default Sidebar;


