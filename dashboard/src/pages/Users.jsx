import axios from "axios";
import './Users.css';
import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Paper,
  Stack,
  TextField,
  Button,
  Table,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  TableContainer,
  Typography,
} from "@mui/material";

const getPhotoUrl = (photoPath) => {
  if (!photoPath) return '';
  return photoPath.startsWith('uploads/') ? `http://localhost:1337/${photoPath}` : `http://localhost:1337/uploads/${photoPath}`;
};

function Users() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [users, setUsers] = useState([])  
    const [editIndex, setEditIndex] = useState(null)
    const [editUserId, setEditUserId] = useState(null)
    const [userPhoto, setUserPhoto] = useState(null)
    const [existingPhotoPath, setExistingPhotoPath] = useState('')
    const [errors, setErrors] = useState({})

  const MAX_NAME_LENGTH = 50;
  const nameRegex = /^[A-Za-z-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleNameChange = (value) => {
    setName(value.replace(/[^A-Za-z-]/g, '').slice(0, MAX_NAME_LENGTH));
  };

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

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > MAX_NAME_LENGTH) {
      newErrors.name = `Name cannot exceed ${MAX_NAME_LENGTH} characters`;
    } else if (!nameRegex.test(name)) {
      newErrors.name = 'Name can only contain letters and hyphens (-)';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Email must be valid';
    }
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setUserPhoto(null);
    setExistingPhotoPath('');
    setEditUserId(null);
    setEditIndex(null);
    setErrors({});
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
        formData.append('userPhoto', userPhoto);
        try {
          const photoRes = await axios.post('http://localhost:1337/upload-user-photo', formData);
          if (photoRes.data.success) {
            photoPath = photoRes.data.filepath;
          }
        } catch (photoError) {
          console.error('Photo upload error:', photoError);
        }
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
    } catch (error) {
      console.error(error);
      alert('Error adding user: ' + (error.response?.data?.message || error.message));
    }
  }

  function handleEdit(user, index) {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setEditUserId(user._id);
    setEditIndex(index);
    setExistingPhotoPath(user.photoPath || '');
    setUserPhoto(null);
    setErrors({});
  }

  async function handleUpdateUser() {
      if (!validateForm()) {
        alert('Please fix the errors before submitting');
        return;
      }
      try {
        let photoPath = existingPhotoPath || '';

        if (userPhoto) {
          const formData = new FormData();
          formData.append('userPhoto', userPhoto);

          const photoRes = await axios.post('http://localhost:1337/upload-user-photo', formData);
          if (photoRes.data.success) {
            photoPath = photoRes.data.filepath;
          } else {
            throw new Error(photoRes.data.message || 'Failed to upload photo');
          }
        }

        await axios.put(`http://localhost:1337/edit-user-db/${editUserId}`, {
          name: name,
          email: email,
          password: password,
          photoPath: photoPath
        });
        alert('User updated successfully');
        fetchUsers(); // Refresh the user list after updating
        resetForm();
      } catch (error) {
        console.error(error);
        alert('Error updating user');
      }
    };

  async function handleDeleteUser(userId) {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:1337/delete-user-db/${userId}`);
        alert('User deleted successfully');
        fetchUsers(); // refresh list
      } catch (error) {
        console.error(error);
        alert('Error deleting user');
      }
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: '100vh', bgcolor: '#f3f6fb' }}>
      <Paper elevation={3} sx={{ flex: '0 0 420px', p: 3, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h4" fontWeight={700}>Users</Typography>
          <TextField label="Name" variant="outlined" fullWidth value={name} onChange={(e) => handleNameChange(e.target.value)} />
          <TextField label="Email" variant="outlined" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField label="Password" type="password" variant="outlined" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button component="label" variant="outlined">
            Choose Photo
            <input hidden type="file" accept="image/*" onChange={(e) => setUserPhoto(e.target.files[0])} />
          </Button>
          {(userPhoto || existingPhotoPath) && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={userPhoto ? URL.createObjectURL(userPhoto) : getPhotoUrl(existingPhotoPath)} sx={{ width: 72, height: 72 }} />
              <Typography variant="body2" color="text.secondary">Photo preview</Typography>
            </Stack>
          )}
          {errors.name && <Typography color="error" variant="body2">{errors.name}</Typography>}
          {errors.email && <Typography color="error" variant="body2">{errors.email}</Typography>}
          {errors.password && <Typography color="error" variant="body2">{errors.password}</Typography>}
          <Stack direction="row" spacing={1}>
            {editIndex === null ? (
              <Button variant="contained" onClick={handleAddUser} fullWidth>Add User</Button>
            ) : (
              <>
                <Button variant="contained" onClick={handleUpdateUser} fullWidth>Update User</Button>
                <Button variant="outlined" color="secondary" onClick={resetForm} fullWidth>Cancel</Button>
              </>
            )}
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={3} sx={{ flex: 1, p: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Typography variant="h5" fontWeight={700} mb={2}>User List</Typography>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 120px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Password</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Avatar src={getPhotoUrl(user.photoPath)} alt={user.name} sx={{ width: 56, height: 56 }} />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.password}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" onClick={() => handleEdit(user, index)} sx={{ mr: 1 }}>Edit</Button>
                    <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteUser(user._id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  )
}

export default Users;
