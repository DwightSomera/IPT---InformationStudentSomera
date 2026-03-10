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
    };

    return (
    <div className="home-container">
        <div className="panel form-wrapper">
            <h1>Add Student</h1>
            <div className="form">
                    <TextField id="id-number" label="ID Number" variant="outlined" type="number" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} />
                    <TextField id="first-name" label="First Name" variant="outlined"  type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    <TextField id="last-name" label="Last Name" variant="outlined" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    <TextField id="middle-name" label="Middle Name" variant="outlined" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} />
                    <TextField id="course" label="Course" variant="outlined" type="text" value={course} onChange={(e) => setCourse(e.target.value)} />
                    <TextField id="year-level" label="Year Level" variant="outlined" type="number" value={yearLevel} onChange={(e) => setYearLevel(e.target.value)} />
                    <Button className="add-btn" variant="contained" size="large" color="primary" onClick={handleAddStudent}>Add Student</Button>
           
           <h2>Students List</h2>
           <Table>  
            <TableBody>
                <TableRow>
                    <TableCell>ID Cell</TableCell>
                    <TableCell>First Name Cell</TableCell>
                    <TableCell>Last Name Cell</TableCell>
                    <TableCell>Middle Name Cell</TableCell>
                    <TableCell>Course Cell</TableCell>
                    <TableCell>Year Level Cell</TableCell>
                </TableRow>
                     {users.map((user, index) => (
                        <TableRow key={index}>
                            <TableCell>{user.idNumber}</TableCell>
                            <TableCell>{user.firstName}</TableCell>  
                            <TableCell>{user.lastName}</TableCell>
                            <TableCell>{user.middleName}</TableCell>
                            <TableCell>{user.course}</TableCell>
                            <TableCell>{user.yearLevel}</TableCell>
                        </TableRow>
                     ))}

            </TableBody>
           </Table>
      
            </div>
        </div>
    </div>
    )
}
export default AddStudent;