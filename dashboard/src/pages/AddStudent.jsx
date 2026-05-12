import './AddStudent.css';
import axios from 'axios'
import { useState } from 'react'
import { TextField, Button, TableCell, TableRow, TableBody, Table, Select, MenuItem, FormControl, InputLabel, FormHelperText, Box, Typography } from '@mui/material'
import { useEffect } from 'react';

const getPhotoUrl = (photoPath) => {
  if (!photoPath) return null;
  return photoPath.startsWith('uploads/')
    ? `http://localhost:1337/${photoPath}`
    : `http://localhost:1337/uploads/${photoPath}`;
};
 
function AddStudent () {
    const MAX_ID_LENGTH = 12;
    const MAX_NAME_LENGTH = 50;

    const [idNumber, setIdNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [course, setCourse] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [users, setUsers] = useState([]);  // replaced/add users state
    const [editStudentId, setEditStudentId] = useState(null) // Track which student is being edited (edit)
    const [errors, setErrors] = useState({});
    const [studentPhoto, setStudentPhoto] = useState(null);
    const [existingPhotoPath, setExistingPhotoPath] = useState('');

        // Fetch students from the server
        function fetchStudents(){
        axios.get('http://localhost:1337/students-db')
        .then(response => {
            setUsers(response.data);
            console.log(response.data);
        })
        .catch(error => {
            console.error(error);
        });
        }

    // Validation function for name fields (letters and "-" only)
    const isValidName = (name) => {
        const nameRegex = /^[a-zA-Z-]*$/;
        return nameRegex.test(name);
    };

    // Filter input to only allow letters and hyphens
    const filterNameInput = (value) => {
        return value.replace(/[^a-zA-Z-]/g, '').slice(0, MAX_NAME_LENGTH);
    };

    // Filter input to only allow numeric digits
    const filterIdInput = (value) => {
        return value.replace(/[^0-9]/g, '').slice(0, MAX_ID_LENGTH);
    };

    // Handle photo file selection
    const handlePhotoChange = (e) => {
        setStudentPhoto(e.target.files[0]);
    };

    // Check if ID is unique
    const isIdUnique = (id, currentStudentId = null) => {
        const normalizedId = id.toString();
        return !users.some((user) => {
            const userId = user.idNumber?.toString();
            return userId === normalizedId && user._id !== currentStudentId;
        });
    };

    // Check if full name is unique
    const isFullNameUnique = (first, last, middle, currentStudentId = null) => {
        const normalizedFirst = first.trim().toLowerCase();
        const normalizedLast = last.trim().toLowerCase();
        const normalizedMiddle = (middle || '').trim().toLowerCase();

        return !users.some((user) => {
            if (user._id === currentStudentId) return false;
            const userFirst = (user.firstName || '').trim().toLowerCase();
            const userLast = (user.lastName || '').trim().toLowerCase();
            const userMiddle = (user.middleName || '').trim().toLowerCase();
            return userFirst === normalizedFirst && userLast === normalizedLast && userMiddle === normalizedMiddle;
        });
    };

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        if (!idNumber) {
            newErrors.idNumber = 'ID Number is required';
        } else if (idNumber.length > MAX_ID_LENGTH) {
            newErrors.idNumber = `ID Number cannot exceed ${MAX_ID_LENGTH} digits`;
        } else if (parseInt(idNumber) <= 0) {
            newErrors.idNumber = 'ID Number must be positive';
        } else if (!isIdUnique(idNumber, editStudentId)) {
            newErrors.idNumber = 'ID Number already exists';
        }

        if (!firstName) {
            newErrors.firstName = 'First Name is required';
        } else if (firstName.length > MAX_NAME_LENGTH) {
            newErrors.firstName = `First Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (!isValidName(firstName)) {
            newErrors.firstName = 'First Name can only contain letters and hyphens (-)';
        }

        if (!lastName) {
            newErrors.lastName = 'Last Name is required';
        } else if (lastName.length > MAX_NAME_LENGTH) {
            newErrors.lastName = `Last Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (!isValidName(lastName)) {
            newErrors.lastName = 'Last Name can only contain letters and hyphens (-)';
        }

        if (middleName && middleName.length > MAX_NAME_LENGTH) {
            newErrors.middleName = `Middle Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (middleName && !isValidName(middleName)) {
            newErrors.middleName = 'Middle Name can only contain letters and hyphens (-)';
        }

        if (!newErrors.firstName && !newErrors.lastName && !newErrors.middleName) {
            if (!isFullNameUnique(firstName, lastName, middleName, editStudentId)) {
                newErrors.firstName = 'This student name already exists';
                newErrors.lastName = 'This student name already exists';
                if (middleName) {
                    newErrors.middleName = 'This student name already exists';
                }
            }
        }

        if (!course) {
            newErrors.course = 'Course is required';
        }

        if (!yearLevel) {
            newErrors.yearLevel = 'Year Level is required';
        }

        if (!studentPhoto && !existingPhotoPath) {
            newErrors.studentPhoto = 'Student photo is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Fetch students when the component mounts
    useEffect(() => {
      fetchStudents();
    }, []);

    const handleAddStudent = async () => {
        if (!validateForm()) {
            alert('Please fix the errors before submitting');
            return;
        }
        
        try {
            let photoPath = '';
            
            // Upload photo if selected
            if (studentPhoto) {
                const formData = new FormData();
                formData.append('studentPhoto', studentPhoto);
                
                try {
                    const photoRes = await axios.post('http://localhost:1337/upload-student-photo', formData);
                    
                    if (photoRes.data.success) {
                        photoPath = photoRes.data.filepath;
                    } else {
                        throw new Error(photoRes.data.message);
                    }
                } catch (photoError) {
                    console.error('Photo upload error:', photoError);
                    throw new Error('Failed to upload photo: ' + (photoError.response?.data?.message || photoError.message));
                }
            }
            
            // Add student with photo path
            const student = {
                idNumber,
                firstName,
                lastName,
                middleName,
                course,
                yearLevel,
                photoPath: photoPath
            };
            
            await axios.post('http://localhost:1337/add-student-db', student);
            alert('Student added successfully');
            fetchStudents(); // refresh list
            
            // Reset form
            setIdNumber('');
            setFirstName('');
            setLastName('');        
            setMiddleName('');
            setCourse('');
            setYearLevel('');
            setStudentPhoto(null);
            setExistingPhotoPath('');
            setErrors({});
        } catch (error) {
            console.error(error);
            alert('Error adding student: ' + error.message);
        }
    }





    //Edit or Update Student
        function handleEdit(user) {
      setIdNumber(user.idNumber);
      setFirstName(user.firstName);
        setLastName(user.lastName);
        setMiddleName(user.middleName);
        setCourse(user.course);
        setYearLevel(user.yearLevel); // Set the index of the student being edited
            setEditStudentId(user._id);
        setStudentPhoto(null);
        setExistingPhotoPath(user.photoPath || '');
        setErrors({});
    }

    async function handleUpdateStudent() {
      if (!validateForm()) {
        alert('Please fix the errors before submitting');
        return;
      }

      try {
        let photoPath = existingPhotoPath || '';

        if (studentPhoto) {
          const formData = new FormData();
          formData.append('studentPhoto', studentPhoto);

          const photoRes = await axios.post('http://localhost:1337/upload-student-photo', formData);
          if (photoRes.data.success) {
            photoPath = photoRes.data.filepath;
          } else {
            throw new Error(photoRes.data.message);
          }
        }

                await axios.put(`http://localhost:1337/edit-students-db/${editStudentId}`, {
          idNumber: idNumber,
          firstName: firstName,
          lastName: lastName,
          middleName: middleName,
          course: course,
          yearLevel: yearLevel,
          photoPath: photoPath
        });
        alert('Student updated successfully');
        fetchStudents(); // refresh list
        setIdNumber('');
        setFirstName('');
        setLastName('');        
        setMiddleName('');
        setCourse('');
        setYearLevel('');
        setStudentPhoto(null);
        setExistingPhotoPath('');
                setEditStudentId(null);
        setErrors({});
      } catch (error) {
        console.error(error);
        alert('Error updating student');
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


                    {editIndex === null ? (
                        <Button variant = "contained" color="primary" onClick={handleAddStudent}>Add Student</Button>
                    ) : 
                        <Button variant = "contained" color="primary" onClick={handleUpdateStudent}>Update Student</Button>
                    }
  
                    
           
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
 