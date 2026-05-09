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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [password, setPassword] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);
  const [existingPhotoPath, setExistingPhotoPath] = useState('');
  const [errors, setErrors] = useState({});

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setEditUserId(null);
  }

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

      await axios.put(`http://localhost:1337/edit-user-db/${editUserId}`, {
        name,
        email,
        password,
        photoPath,
      });

      alert("User updated!");
      fetchUsers();
      resetForm();
      setUserPhoto(null);
      setExistingPhotoPath('');
      setErrors({});
    } catch (error) {
      console.error(error);
      alert('Error updating user: ' + (error.response?.data?.message || error.message));
    }
  }

  function handleOpenDeleteDialog(userId) {
    setDeleteUserId(userId);
  }

  function handleCloseDeleteDialog() {
    setDeleteUserId(null);
  }

  async function deleteUser(userId) {
    try {
      await axios.delete(`http://localhost:1337/delete-user-db/${userId}`);
      if (editUserId === userId) resetForm();
      alert("User deleted!");
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  }

  async function handleConfirmDeleteUser() {
    if (!deleteUserId) return;
    await deleteUser(deleteUserId);
    handleCloseDeleteDialog();
  }

  // Validation helpers
  const isValidName = (value) => {
    const nameRegex = /^[a-zA-Z-\s]+$/;
    return nameRegex.test(value.trim());
  };

  const isValidEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!name || !isValidName(name)) newErrors.name = 'Name required (letters and - only)';
    if (!email || !isValidEmail(email)) newErrors.email = 'Valid email is required';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePhotoChange = (e) => {
    setUserPhoto(e.target.files[0]);
  };

  return (
    <div className="users-container">
      <div className="form-wrapper">
        <h1>Users</h1>

        <div className="form">
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z-\s]/g, ''))}
            error={!!errors.name}
            helperText={errors.name}
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />

          <div style={{ marginTop: 8 }}>
            <input id="user-photo" type="file" accept="image/jpeg,image/png" style={{ display: 'none' }} onChange={handlePhotoChange} />
            <label htmlFor="user-photo">
              <Button component="span" variant="contained" sx={{ textTransform: 'none' }}>Choose Photo</Button>
            </label>
            {userPhoto ? (
              <div style={{ marginTop: 8 }}>{userPhoto.name}</div>
            ) : existingPhotoPath ? (
              <div style={{ marginTop: 8 }}>
                <img src={existingPhotoPath.startsWith('uploads/') ? `http://localhost:1337/${existingPhotoPath}` : `http://localhost:1337/uploads/${existingPhotoPath}`} alt="current" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6 }} />
              </div>
            ) : null}
          </div>

          <Stack direction="row" spacing={2} sx={{ mt: 2, mb: 3 }}>
            {editUserId === null ? (
              <Button variant="contained" color="primary" onClick={handleAddUser}>
                Add User
              </Button>
            ) : (
              <>
                <Button variant="contained" color="secondary" onClick={handleUpdateUser}>
                  Update User
                </Button>

                <Button variant="outlined" color="inherit" onClick={resetForm}>
                  Cancel
                </Button>
              </>
            )}
          </Stack>
        </div>
      </div>

      <div className="user-list-wrapper">
        <div className="user-list-header">
          <h2>User List</h2>
        </div>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Photo</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Password</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                  <TableCell>
                    {user.photoPath ? (
                      <img src={getPhotoUrl(user.photoPath)} alt="avatar" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f0f0f0' }} />
                    )}
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.password}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button variant="outlined" onClick={() => handleEdit(user)}>
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleOpenDeleteDialog(user._id)}>
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={deleteUserId !== null} onClose={handleCloseDeleteDialog}>
          <DialogTitle>Delete User</DialogTitle>
          <DialogContent>
            <DialogContentText>Are you sure you want to delete this user?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDeleteDialog} color="inherit">
              Cancel
            </Button>
            <Button onClick={handleConfirmDeleteUser} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}

export default Users;
