import './AddStudent.css';
import axios from 'axios'
import { useState } from 'react'
import { TextField, Button, TableCell, TableRow, TableBody, Table } from '@mui/material'
import { useEffect } from 'react';
 
function AddStudent () {
    const [idNumber, setIdNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [course, setCourse] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [users, setUsers] = useState([]);  // replaced/add users state
    const [editIndex, setEditIndex] = useState(null) // Track which student is being edited (edit)
 
        // Fetch students from the server
        function fetchStudents(){
        axios.get('http://localhost:1337/students')
        .then(response => {
            setUsers(response.data);
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
        }
 
    // Fetch students when the component mounts
    useEffect(() => {
      fetchStudents();
    }, []);
 
    const handleAddStudent = async () => {
        try {
            const student = {
                idNumber,
                firstName,
                lastName,
                middleName,
                course,
                yearLevel
            };
            await axios.post('http://localhost:1337/add-student', student);
            alert('Student added successfully');
            fetchStudents(); // refresh list
            setIdNumber('');
            setFirstName('');
            setLastName('');        
            setMiddleName('');
            setCourse('');
            setYearLevel('');
        } catch (error) {
            console.error(error);
            alert('Error adding student');
        }
    }
 
 
 
 
 
    //edit student
    function handleEdit(user, index) {
      setIdNumber(user.idNumber);
      setFirstName(user.firstName);
        setLastName(user.lastName);
        setMiddleName(user.middleName);
        setCourse(user.course);
        setYearLevel(user.yearLevel); // Set the index of the student being edited
        setEditIndex(index);
 
    }
 
    async function handleUpdateStudent() {
      try {
        await axios.put(`http://localhost:1337/edit-students/${editIndex}`, {
          idNumber: idNumber,
          firstName: firstName,
          lastName: lastName,
          middleName: middleName,
          course: course,
          yearLevel: yearLevel
        });
        alert('Student updated successfully');
        fetchStudents(); // refresh list
        setIdNumber('');
        setFirstName('');
        setLastName('');        
        setMiddleName('');
        setCourse('');
        setYearLevel('');
        setEditIndex(null);
      } catch (error) {
        console.error(error);
        alert('Error updating student');
      }
    };
 
    //Delete student
        async function handleDelete(user, index) {
 
            const confirmDelete = window.confirm(`Are you sure you want to delete ${user.firstName}?`);
            if (!confirmDelete) {
                return; // Exit if the user cancels the deletion
            }
 
            try {
                await axios.delete(`http://localhost:1337/delete-student/${index}`);
                alert('Student deleted successfully');
                fetchStudents(); // refresh list
            }
            catch (error) {
                console.error(error);
                alert('Error deleting student');
            }
        }
 
 
 
 
 
        return (
            <div className="AddStudent-container">
                <div className="form-wrapper">
                    <h1>Add Student</h1>
                    <div className="form">
                        <TextField id="id-number" label="ID Number" variant="outlined" type="number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                        <TextField id="first-name" label="First Name" variant="outlined"  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <TextField id="last-name" label="Last Name" variant="outlined" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <TextField id="middle-name" label="Middle Name" variant="outlined" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                        <TextField id="course" label="Course" variant="outlined" type="text" value={course} onChange={(e) => setCourse(e.target.value)} />
                        <TextField id="year-level" label="Year Level" variant="outlined" type="number" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} />
                        {editIndex === null ? (
                            <Button variant = "contained" color="primary" onClick={handleAddStudent}>Add Student</Button>
                        ) :
                            <Button variant = "contained" color="primary" onClick={handleUpdateStudent}>Update Student</Button>
                        }
                    </div>
                </div>
                <div className="students-list-wrapper">
                    <h2>Students List</h2>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Middle Name</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Year Level</TableCell>
                            </TableRow>
                            {users.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.idNumber}</TableCell>
                                    <TableCell>{user.firstName}</TableCell>
                                    <TableCell>{user.lastName}</TableCell>
                                    <TableCell>{user.middleName}</TableCell>
                                    <TableCell>{user.course}</TableCell>
                                    <TableCell>{user.yearLevel}</TableCell>
 
                                    <TableCell>
                                        <Button variant="outlined" color="primary" onClick={() => handleEdit(user, index)}>Edit</Button>
                                    </TableCell>
 
                                      <TableCell>
                                         <Button variant="outlined" color="primary" onClick={() => handleDelete(user, index)}>Delete</Button>
                                     </TableCell>
 
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
}
export default AddStudent;
 
 