import Button from '@mui/material/Button';
import './Car.css';
import React from 'react';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
 
function Car() {
  const [model, setMode] = useState("Wigo");
  const [color, setColor] = useState("Pink");
  const [year, setYear] = useState("2012");
 
  let tempColor = "";
  let tempModel = "";
  let tempYear = "";
 
  function handleChange(e) {
    const { name, value } = e.target;
    if (name === "model") {
      tempModel = value;
    } else if (name === "color") {
      tempColor = value;
    } else if (name === "year") {
      tempYear = value;
    }
  }
 
  function handleClick() {
    setMode(tempModel);
    setColor(tempColor);
    setYear(tempYear);
  }
 
  return (
    <div className="car-container">
        <div>Car</div>
        <TextField name="model" label="Model"  onChange={handleChange}/>
        <TextField name="color" label="Color" onChange={handleChange}/>
        <TextField name="year" label="Year" onChange={handleChange}/>

        <p>Model: {model}</p>
        <p>Color: {color}</p>
        <p>Year: {year}</p>

        <p>My car is a {color} {model} with the year {year}</p>

        <Button onClick={() => setColor("burgundy")}>CHANGE COLOR</Button>
        <Button onClick={handleClick}>UPDATE CAR</Button>
    </div>
  );
}
 
export default Car;
 