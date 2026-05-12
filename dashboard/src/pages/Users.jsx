import axios from "axios";
import './Users.css';
import { useEffect, useState } from "react";
import {
  TextField,
  Button,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
} from "@mui/material";

function Users() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [users, setUsers] = useState([])  
    const [editIndex, setEditIndex] = useState(null) // Track which user is being edited (edit)

//Fetch users from the server
function fetchUsers() {
    axios
      .get("http://localhost:1337/users-db")
      .then((response) => setUsers(response.data))
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return photoPath.startsWith('uploads/') ? `http://localhost:1337/${photoPath}` : `http://localhost:1337/uploads/${photoPath}`;
  };

  async function handleAddUser() {
    if (!validateForm()) {
      alert('Please fix the errors before submitting');
      return;
    }

    try {
      let photoPath = existingPhotoPath || '';

      if (userPhoto) {
        const formData = new FormData();
        formData.append('studentPhoto', userPhoto);
        const photoRes = await axios.post('http://localhost:1337/upload-student-photo', formData);
        if (photoRes.data.success) photoPath = photoRes.data.filepath;
      }

      await axios.post("http://localhost:1337/add-user-db", {
        name,
        email,
        password,
        photoPath,
      });

      alert("User added!");
      fetchUsers();
      resetForm();
      setUserPhoto(null);
      setExistingPhotoPath('');
      setErrors({});
    } catch (error) {
      console.error(error);
      alert('Error adding user: ' + (error.response?.data?.message || error.message));
    }
  }

  function handleEdit(user) {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setEditUserId(user._id);
    setExistingPhotoPath(user.photoPath || '');
    setUserPhoto(null);
    setErrors({});
  }

  async function handleUpdateUser() {
      try {
        await axios.put(`http://localhost:1337/edit-user/${editIndex}`, {
          name: name,
          email: email,
          password: password
        });
        alert('User updated successfully');
        fetchUsers(); // Refresh the user list after updating
        setName('');
        setEmail('');
        setPassword('');
        setEditIndex(null); // Clear the edit index after updating
      } catch (error) {
        console.error(error);
      }
    };





  return (
    <div className="users-container">
      <div className="form-wrapper">
        <h1>Users</h1>
        <TextField label="Name" variant="outlined" fullWidth margin="normal" value={name} onChange={(e) => setName(e.target.value)} />
        <TextField label="Email" variant="outlined" fullWidth margin="normal" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextField label="Password" type="password" variant="outlined" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
        
        
        {editIndex === null ?(
          <Button variant = "contained" color="primary" onClick={handleAddUser}>Add User</Button>
        ) :
        <Button variant = "contained" color="primary" onClick={handleUpdateUser}>Update User</Button>
      }


    <h2>User List</h2>
                <Table>
                    <TableBody>
                        <TableRow>                                    
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Password</TableCell>                      
                        </TableRow>
                        {users.map((user, index) => (
                            <TableRow key={index}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.password}</TableCell>

                                <TableCell>
                                  <Button variant="outlined" color="primary" onClick={() => handleEdit(user, index)}>Edit</Button>
                                </TableCell>

                            </TableRow>
                        ))}
                    </TableBody>
                </Table>


      </div>  
    </div>
  )
}

export default Users;
