const express = require('express');

const cors = require('cors');
const fs = require('fs');
 
const app = express();

app.use(cors());
app.use(express.json());
 
 
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


//Edit user
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
 
 
 
 