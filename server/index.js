const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const upload = require('./middleware/upload');

//calling mongoose
const mongoose = require('mongoose');
const User = require('./model/user.model');

const app = express();


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files
 


//db connection of mongoose
mongoose 
  .connect("mongodb://127.0.0.1:27017/SIS-db")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Connection error:", err));



 
//add user to database
app.post('/add-user-db', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const newUser = new User({ name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ message: 'Error adding user', error: error. Message });
  }
});

//view users from db
app.get('/users-db', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

 


//Add user
app.post('/add-user', (req, res) => {
  const newUser = req.body;
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    const users = JSON.parse(data);
    users.push(newUser);
    fs.writeFile('data.json', JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing file');
      }
      res.send('User added successfully');
    });
  });
});


//fetch user
app.get('/users', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {  return res.status(500).send('Error reading file'); 

    }
    res.send(data);
  });
});


// Update/Edit user
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
 
      res.send("User updated successfully!");
    });
  });
});
 
//Delete user
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
      res.send("User deleted successfully!");
    });

  });
});



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


//Add student
// app.post('/add-student', (req, res) => {
//   const newStudent = req.body;
//   fs.readFile('student.json', 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).send('Error reading file');
//     }
//     const students = JSON.parse(data);
//     students.push(newStudent);
//     fs.writeFile('student.json', JSON.stringify(students, null, 2), (err) => {
//       if (err) {
//         return res.status(500).send('Error writing file');
//       }
//       res.send('Student added successfully');
//     });
//   });
// });
 
// //fetch students
// app.get('/add-student', (req, res) => {
//   fs.readFile('student.json', 'utf8', (err, data) => {
//     if (err) {
//       return res.status(500).send('Error reading file');
//     }
//     res.send(data);
//   });
// });
 


//Add student
app.post('/add-student', (req, res) => {
  const newStudent = req.body;
  fs.readFile('student.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    const students = JSON.parse(data);
    students.push(newStudent);
    fs.writeFile('student.json', JSON.stringify(students, null, 2), (err) => {
      if (err) {
        return res.status(500).send('Error writing file');
      }
      res.send('Student added successfully');
    });
  });
});
 

//Fetch Students
app.get('/students', (req, res) => {
  fs.readFile('student.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading file');
    }
    const students = JSON.parse(data);
    res.json(students);
  });
});
 
 
//Edit (update) student
app.put("/edit-students/:index", (req, res) => {
  const index = parseInt(req.params.index);
  const updatedUser = req.body;

  fs.readFile("student.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }

    const users = JSON.parse(data);

    if(users[index] === undefined) {  
      return res.status(404).send("Student not found");
    } 

    users[index] = updatedUser;

    fs.writeFile("student.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error writing file");
      }
      res.send("Student updated successfully");
    });
  })
});


//Delete student
app.delete("/delete-student/:index", (req, res) => {
  const index = parseInt(req.params.index);

  fs.readFile("student.json", "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }
    const users = JSON.parse(data);
    if(users[index] === undefined) {
      return res.status(404).send("Student not found");
    }
    users.splice(index, 1);
    fs.writeFile("student.json", JSON.stringify(users, null, 2), (err) => {
      if (err) {
        return res.status(500).send("Error writing file");
      }
      res.send("Student deleted successfully");
     });
  })
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
 
 
 
 