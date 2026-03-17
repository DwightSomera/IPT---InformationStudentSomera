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
    const [idNumber, setIdNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [course, setCourse] = useState('');
    const [yearLevel, setYearLevel] = useState('');
    const [users, setUsers] = useState([]);  // replaced/add users state
    const [editIndex, setEditIndex] = useState(null) // Track which student is being edited (edit)
    const [errors, setErrors] = useState({});
    const [studentPhoto, setStudentPhoto] = useState(null);
    const [existingPhotoPath, setExistingPhotoPath] = useState('');

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

    // Validation function for name fields (letters and "-" only)
    const isValidName = (name) => {
        const nameRegex = /^[a-zA-Z\-]*$/;
        return nameRegex.test(name);
    };

    // Filter input to only allow letters and hyphens
    const filterNameInput = (value) => {
        return value.replace(/[^a-zA-Z\-]/g, '');
    };

    // Filter input to only allow numeric digits
    const filterIdInput = (value) => {
        return value.replace(/[^0-9]/g, '');
    };

    // Handle photo file selection
    const handlePhotoChange = (e) => {
        setStudentPhoto(e.target.files[0]);
    };

    // Check if ID is unique
    const isIdUnique = (id, currentIndex = null) => {
        const normalizedId = id.toString();
        return !users.some((user, idx) => {
            const userId = user.idNumber?.toString();
            return userId === normalizedId && idx !== currentIndex;
        });
    };

    // Check if full name is unique
    const isFullNameUnique = (first, last, middle, currentIndex = null) => {
        const normalizedFirst = first.trim().toLowerCase();
        const normalizedLast = last.trim().toLowerCase();
        const normalizedMiddle = (middle || '').trim().toLowerCase();

        return !users.some((user, idx) => {
            if (idx === currentIndex) return false;
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
        } else if (parseInt(idNumber) <= 0) {
            newErrors.idNumber = 'ID Number must be positive';
        } else if (!isIdUnique(idNumber, editIndex)) {
            newErrors.idNumber = 'ID Number already exists';
        }

        if (!firstName) {
            newErrors.firstName = 'First Name is required';
        } else if (!isValidName(firstName)) {
            newErrors.firstName = 'First Name can only contain letters and hyphens (-)';
        }

        if (!lastName) {
            newErrors.lastName = 'Last Name is required';
        } else if (!isValidName(lastName)) {
            newErrors.lastName = 'Last Name can only contain letters and hyphens (-)';
        }

        if (middleName && !isValidName(middleName)) {
            newErrors.middleName = 'Middle Name can only contain letters and hyphens (-)';
        }

        if (!newErrors.firstName && !newErrors.lastName && !newErrors.middleName) {
            if (!isFullNameUnique(firstName, lastName, middleName, editIndex)) {
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
            
            await axios.post('http://localhost:1337/add-student', student);
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
    function handleEdit(user, index) {
      setIdNumber(user.idNumber);
      setFirstName(user.firstName);
        setLastName(user.lastName);
        setMiddleName(user.middleName);
        setCourse(user.course);
        setYearLevel(user.yearLevel); // Set the index of the student being edited
        setEditIndex(index);
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

        await axios.put(`http://localhost:1337/edit-students/${editIndex}`, {
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
        setEditIndex(null);
        setErrors({});
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
                        <TextField 
                            id="id-number" 
                            label="ID Number" 
                            variant="outlined" 
                            type="text" 
                            value={idNumber} 
                            onChange={(e) => setIdNumber(filterIdInput(e.target.value))} 
                            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                            error={!!errors.idNumber}
                            helperText={errors.idNumber}
                        />
                        <TextField 
                            id="first-name" 
                            label="First Name" 
                            variant="outlined"  
                            type="text" 
                            value={firstName} 
                            onChange={(e) => setFirstName(filterNameInput(e.target.value))} 
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                        />
                        <TextField 
                            id="last-name" 
                            label="Last Name" 
                            variant="outlined" 
                            type="text" 
                            value={lastName} 
                            onChange={(e) => setLastName(filterNameInput(e.target.value))} 
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                        />
                        <TextField 
                            id="middle-name" 
                            label="Middle Name" 
                            variant="outlined" 
                            type="text" 
                            value={middleName} 
                            onChange={(e) => setMiddleName(filterNameInput(e.target.value))} 
                            error={!!errors.middleName}
                            helperText={errors.middleName}
                        />
                        <Box sx={{ marginTop: '8px' }}>
                            <input 
                                id="student-photo"
                                type="file" 
                                accept="image/jpeg,image/png"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="student-photo" style={{ display: 'block' }}>
                                <Button
                                    variant="contained"
                                    component="span"
                                    sx={{ marginBottom: '8px', textTransform: 'none', fontSize: '1rem' }}
                                >
                                    Choose Photo
                                </Button>
                            </label>
                            {studentPhoto ? (
                                <Typography variant="body2" sx={{ color: '#4CAF50', margin: '4px 0', fontWeight: '500' }}>
                                    ✓ {studentPhoto.name}
                                </Typography>
                            ) : existingPhotoPath ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                    <img
                                        src={getPhotoUrl(existingPhotoPath)}
                                        alt="Current student photo"
                                        style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #ccc' }}
                                    />
                                    <Typography variant="body2" sx={{ color: '#333', fontSize: '0.9rem' }}>
                                        Current photo
                                    </Typography>
                                </Box>
                            ) : null}
                            {errors.studentPhoto && (
                                <Typography variant="caption" sx={{ color: '#d32f2f', display: 'block', mt: 1 }}>
                                    {errors.studentPhoto}
                                </Typography>
                            )}
                        </Box>
                        <FormControl fullWidth error={!!errors.course}>
                            <InputLabel id="course-label">Course</InputLabel>
                            <Select
                                labelId="course-label"
                                id="course"
                                label="Course"
                                value={course}
                                onChange={(e) => setCourse(e.target.value)}
                            >
                                <MenuItem value="">-- Select a Course --</MenuItem>
                                <MenuItem value="BSIT">BSIT</MenuItem>
                                <MenuItem value="BSCS">BSCS</MenuItem>
                                <MenuItem value="BSLIS">BSLIS</MenuItem>
                                <MenuItem value="BSMATH">BSMATH</MenuItem>
                                <MenuItem value="BSCE">BSCE</MenuItem>
                                <MenuItem value="BSARKI">BSARKI</MenuItem>
                                <MenuItem value="BSCPE">BSCPE</MenuItem>
                                <MenuItem value="BSECE">BSECE</MenuItem>
                                <MenuItem value="BSEE">BSEE</MenuItem>
                            </Select>
                            {errors.course && <FormHelperText>{errors.course}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth error={!!errors.yearLevel}>
                            <InputLabel id="year-level-label">Year Level</InputLabel>
                            <Select
                                labelId="year-level-label"
                                id="year-level"
                                label="Year Level"
                                value={yearLevel}
                                onChange={(e) => setYearLevel(e.target.value)}
                            >
                                <MenuItem value="">-- Select Year Level --</MenuItem>
                                <MenuItem value="1">1st Year</MenuItem>
                                <MenuItem value="2">2nd Year</MenuItem>
                                <MenuItem value="3">3rd Year</MenuItem>
                                <MenuItem value="4">4th Year</MenuItem>
                                <MenuItem value="5">5th Year</MenuItem>
                            </Select>
                            {errors.yearLevel && <FormHelperText>{errors.yearLevel}</FormHelperText>}
                        </FormControl>
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
                                <TableCell>Photo</TableCell>
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Middle Name</TableCell>
                                <TableCell>Course</TableCell>
                                <TableCell>Year Level</TableCell>
                            </TableRow>
                            {users.map((user, index) => (
                                <TableRow key={index}>
                                    <TableCell>{user.idNumber}</TableCell>
                                    <TableCell>
                                        {user.photoPath ? (
                                            <img 
                                                src={getPhotoUrl(user.photoPath)} 
                                                alt="Student photo" 
                                                style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <span style={{ color: '#999', fontSize: '12px' }}>No photo</span>
                                        )}
                                    </TableCell>
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
 