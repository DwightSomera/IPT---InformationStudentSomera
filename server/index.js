const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = require('./middleware/upload');
// const upload = require('./uploads/uploads');


const mongoose = require('mongoose');
const User = require('./model/user.model');
const Student = require('./model/student.model');


const app = express();
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('CORS not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//DB CONNECTION
mongoose
    .connect("mongodb://127.0.0.1:27017/SIS-db")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Connection error:", err));



  //////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////


//index.js for Login

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error logging in");
  }
});






//ADD USER TO JSON FILE
app.post("/add-user", (req, res) => {
    const newUser = req.body;
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading file");
        }
        const users = JSON.parse(data);
        users.push(newUser);
        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error writing file");
            }
            res.send("User added successfully");
        });
    });
});

//ADD USER TO MONGODB
app.post('/add-user-db', async (req, res) => {
  const { name, email, password, photoPath } = req.body;
  try {
    const newUser = new User({ name, email, password, photoPath });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user', error: error.message });
  }
});


//VIEW USERS //FETCH USERS FROM JSON FILE
app.get("/users", (req, res) => {
    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading file");
        }

        const users = JSON.parse(data);
        res.json(users);
    });
});

//VIEW USERS FROM DB //FETCH USERS FROM MONGODB
app.get('/users-db', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});





//EDIT USERS TO JSON FILE
app.put("/edit-user/:index", (req, res) => {
    const index = req.params.index;
    const updatedUser = req.body;

    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading file");
        }

        const users = JSON.parse(data);
        
        if (users[index] === undefined) {
            return res.status(404).send("User not found");
        }

        users[index] = updatedUser;

        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error writing file");
            }

            res.send("User updated successfully");
        });
    });
});




// EDIT USERS TO MONGODB
app.put('/edit-user-db/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, password, photoPath } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, photoPath },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});




//DELETE USERS FROM JSON FILE
app.delete("/delete-user/:index", (req, res) => {
    const index = req.params.index;

    fs.readFile("data.json", "utf8", (err, data) => {
        if (err) {
            return res.status(500).send("Error reading file");
        }

        const users = JSON.parse(data);

        if (users[index] === undefined) {
            return res.status(404).send("User not found");
        }

        users.splice(index, 1);

        fs.writeFile("data.json", JSON.stringify(users, null, 2), (err) => {
            if (err) {
                return res.status(500).send("Error writing file");
            }

            res.send("User deleted successfully");
        });
    });
});




// DELETE USERS FROM MONGODB
app.delete('/delete-user-db/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});



//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////



// Upload student photo
app.post('/upload-student-photo', upload.single('studentPhoto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ 
      success: false,
      message: 'No file uploaded' 
    });
  }

  res.json({
    success: true,
    message: 'Photo uploaded successfully',
    filename: req.file.filename,
    filepath: req.file.filename
  });
});

// Upload user photo
app.post('/upload-user-photo', upload.single('userPhoto'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded'
    });
  }

  res.json({
    success: true,
    message: 'Photo uploaded successfully',
    filename: req.file.filename,
    filepath: req.file.filename
  });
});

// Error handling for upload
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File too large. Maximum size is 5MB' 
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  } else if (err) {
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  next();
});


app.post('/add-student-db', async (req, res) => {
  const { idNumber, firstName, lastName, middleName, course, yearLevel, photoPath } = req.body;

  try {
    const newStudent = new Student({
      idNumber,
      firstName,
      lastName,
      middleName,
      course,
      yearLevel,
      photoPath,
    });

    await newStudent.save();
    return res.status(201).json({ message: 'Student added successfully', student: newStudent });
  } catch (error) {
    console.error('Error adding student:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'ID Number already exists' });
    }

    return res.status(500).json({ message: 'Error adding student', error: error.message });
  }
});
 

//Fetch Students
app.get('/students-db', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    return res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ message: 'Error fetching students', error: error.message });
  }
});
 
 
//Edit (update) student
app.put('/edit-students-db/:id', async (req, res) => {
  const { id } = req.params;
  const { idNumber, firstName, lastName, middleName, course, yearLevel, photoPath } = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { idNumber, firstName, lastName, middleName, course, yearLevel, photoPath },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json({ message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    console.error('Error updating student:', error);

    if (error.code === 11000) {
      return res.status(409).json({ message: 'ID Number already exists' });
    }

    return res.status(500).json({ message: 'Error updating student', error: error.message });
  }
});


//Delete student
app.delete('/delete-student-db/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    return res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ message: 'Error deleting student', error: error.message });
  }
});








// Route with URL parameter
app.get('/user/:name', (req, res) => {
const name = req.params.name;
res.send(`Welcome, ${name}!`);
});
 
// Route with query parameters
app.get('/calculate/:num1/:num2', (req, res) => {
const num1 = parseInt(req.params.num1);
const num2 = parseInt(req.params.num2);
const sum = num1 + num2;
res.send(`The sum of ${num1} and ${num2} is ${sum}`);
});
 
// Route with query string
app.get('/search', (req, res) => {
const query = req.query.q;
if (!query) {
return res.send('Please provide a search query using ?q=your_query');
}
res.send(`You searched for: ${query}`);
});
 
 




// Start the server
const port = 1337;
 
app.listen(port, () => {
 console.log(`Server is running on ${port}`);
});
 
 
 
 