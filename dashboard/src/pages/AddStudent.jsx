import './AddStudent.css';
import axios from 'axios'
import { useState } from 'react'
import { Avatar, Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material'
import { useEffect } from 'react';

const getPhotoUrl = (photoPath) => {
    if (!photoPath) return '';
    return photoPath.startsWith('uploads/') ? `http://localhost:1337/${photoPath}` : `http://localhost:1337/uploads/${photoPath}`;
};
 
function AddStudent () {
    const MAX_NAME_LENGTH = 50;
    const COURSE_OPTIONS = ['BSIT', 'BSCS', 'BSLIS', 'BSARKI', 'BSCE', 'BSMATH'];
    const YEAR_LEVEL_OPTIONS = ['1', '2', '3', '4', '5'];

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
        const idRegex = /^\d{8}$/;
        const nameRegex = /^[a-zA-Z-]+$/;

        if (!idNumber) {
            newErrors.idNumber = 'ID Number is required';
        } else if (!idRegex.test(idNumber)) {
            newErrors.idNumber = 'ID Number must be exactly 8 digits and contain numbers only';
        } else if (!isIdUnique(idNumber, editStudentId)) {
            newErrors.idNumber = 'ID Number already exists';
        }

        if (!firstName) {
            newErrors.firstName = 'First Name is required';
        } else if (firstName.length > MAX_NAME_LENGTH) {
            newErrors.firstName = `First Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (!nameRegex.test(firstName)) {
            newErrors.firstName = 'First Name can only contain letters and hyphens (-)';
        }

        if (!lastName) {
            newErrors.lastName = 'Last Name is required';
        } else if (lastName.length > MAX_NAME_LENGTH) {
            newErrors.lastName = `Last Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (!nameRegex.test(lastName)) {
            newErrors.lastName = 'Last Name can only contain letters and hyphens (-)';
        }

        if (middleName && middleName.length > MAX_NAME_LENGTH) {
            newErrors.middleName = `Middle Name cannot exceed ${MAX_NAME_LENGTH} characters`;
        } else if (middleName && !nameRegex.test(middleName)) {
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
        } else if (!COURSE_OPTIONS.includes(course)) {
            newErrors.course = 'Select a valid course';
        }

        if (!yearLevel) {
            newErrors.yearLevel = 'Year Level is required';
        } else if (!YEAR_LEVEL_OPTIONS.includes(yearLevel.toString())) {
            newErrors.yearLevel = 'Year Level must be between 1 and 5';
        }

        if (!editStudentId && !studentPhoto) {
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

    async function handleDeleteStudent(studentId) {
      if (window.confirm('Are you sure you want to delete this student?')) {
        try {
          await axios.delete(`http://localhost:1337/delete-student-db/${studentId}`);
          alert('Student deleted successfully');
          fetchStudents(); // refresh list
        } catch (error) {
          console.error(error);
          alert('Error deleting student');
        }
      }
    };





    return (
    <Box sx={{ display: 'flex', gap: 3, p: 3, minHeight: '100vh', bgcolor: '#f3f6fb' }}>
        <Paper elevation={3} sx={{ flex: '0 0 420px', p: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
                <Typography variant="h4" fontWeight={700}>Add Student</Typography>
                <TextField
                    label="ID Number"
                    variant="outlined"
                    type="text"
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    inputProps={{ inputMode: 'numeric', maxLength: 8, pattern: '[0-9]*' }}
                    fullWidth
                />
                <TextField label="First Name" variant="outlined" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} fullWidth />
                <TextField label="Last Name" variant="outlined" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} fullWidth />
                <TextField label="Middle Name" variant="outlined" type="text" value={middleName} onChange={(e) => setMiddleName(e.target.value)} fullWidth />
                <FormControl fullWidth>
                    <InputLabel id="course-label">Course</InputLabel>
                    <Select
                        labelId="course-label"
                        label="Course"
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                    >
                        {COURSE_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth>
                    <InputLabel id="year-level-label">Year Level</InputLabel>
                    <Select
                        labelId="year-level-label"
                        label="Year Level"
                        value={yearLevel}
                        onChange={(e) => setYearLevel(e.target.value)}
                    >
                        {YEAR_LEVEL_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Button component="label" variant="outlined">
                    Choose Photo
                    <input hidden type="file" accept="image/*" onChange={handlePhotoChange} />
                </Button>

                {(studentPhoto || existingPhotoPath) && (
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={studentPhoto ? URL.createObjectURL(studentPhoto) : getPhotoUrl(existingPhotoPath)} sx={{ width: 72, height: 72 }} />
                        <Typography variant="body2" color="text.secondary">Photo preview</Typography>
                    </Stack>
                )}

                {errors.studentPhoto && <Typography color="error" variant="body2">{errors.studentPhoto}</Typography>}
                {errors.idNumber && <Typography color="error" variant="body2">{errors.idNumber}</Typography>}
                {errors.firstName && <Typography color="error" variant="body2">{errors.firstName}</Typography>}
                {errors.lastName && <Typography color="error" variant="body2">{errors.lastName}</Typography>}
                {errors.middleName && <Typography color="error" variant="body2">{errors.middleName}</Typography>}
                {errors.course && <Typography color="error" variant="body2">{errors.course}</Typography>}
                {errors.yearLevel && <Typography color="error" variant="body2">{errors.yearLevel}</Typography>}

                <Stack direction="row" spacing={1}>
                    {editStudentId === null ? (
                        <Button variant="contained" onClick={handleAddStudent} fullWidth>Add Student</Button>
                    ) : (
                        <>
                            <Button variant="contained" onClick={handleUpdateStudent} fullWidth>Update Student</Button>
                            <Button variant="outlined" color="secondary" onClick={() => {
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
                            }} fullWidth>Cancel</Button>
                        </>
                    )}
                </Stack>
            </Stack>
        </Paper>

        <Paper elevation={3} sx={{ flex: 1, p: 3, borderRadius: 3, overflow: 'hidden' }}>
            <Typography variant="h5" fontWeight={700} mb={2}>Students List</Typography>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 120px)' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Photo</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>First Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Last Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Middle Name</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Year Level</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user, index) => (
                            <TableRow key={index} hover>
                                <TableCell>
                                    <Avatar src={getPhotoUrl(user.photoPath)} alt={user.firstName} sx={{ width: 56, height: 56 }} />
                                </TableCell>
                                <TableCell>{user.idNumber}</TableCell>
                                <TableCell>{user.firstName}</TableCell>  
                                <TableCell>{user.lastName}</TableCell>
                                <TableCell>{user.middleName}</TableCell>
                                <TableCell>{user.course}</TableCell>
                                <TableCell>{user.yearLevel}</TableCell>
                                <TableCell align="center">
                                    <Button variant="outlined" size="small" onClick={() => handleEdit(user, index)} sx={{ mr: 1 }}>Edit</Button>
                                    <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteStudent(user._id)}>Delete</Button>
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
export default AddStudent;
 