import axios from 'axios'
import { useState } from 'react'
import { TextField, Button, TableCell, TableRow, TableBody, Table } from '@mui/material'
import { useEffect } from 'react'


function Users() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [users, setUsers] = useState([])  
    const [editIndex, setEditIndex] = useState(null) // Track which user is being edited (edit)

//Fetch users from the server
function fetchUsers() {
    axios
    .get('http://localhost:1337/users')
    .then(response => { 
      setUsers(response.data);
      console.log(response.data);
      })
      .catch(error => {
        console.error(error);
      }); 
  }



// Fetch users when the component mounts
useEffect(() => {
    fetchUsers();
  }, []);




      async function handleAddUser() {
        try {
          await axios.post('http://localhost:1337/add-user', {
            name: name,
            email: email,
            password: password
          });

          alert('User added successfully')
          fetchUsers(); // Refresh the user list after adding a new user
          setName('');
          setEmail('');
          setPassword('');
          value = '';

        }catch (error) {
            console.error(error);
        }
      }





  //Edit User
  function handleEdit(user,index) {
    setName(user.name);
    setEmail(user.email);
    setPassword(user.password);
    setEditIndex(index); // Set the index of the user being edited
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
    <div>
      <div>
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

export default Users