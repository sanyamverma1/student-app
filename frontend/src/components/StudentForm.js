import React, { useState } from "react";

function StudentForm() {
  const [inputValue, setInputValue] = useState("");

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Input Value: ${inputValue}`);
  };

  return (
    <div>
      <h2>User Input Page</h2>
      <p>Where are you come from?</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your answer"
          value={inputValue}
          onChange={handleChange}
          required
        />
        {/* <button type="submit">Submit</button> */}
      </form>
      <p>How old are you?</p>
        <input
          type="text"
          placeholder="Enter your answer"
          value={inputValue}
          onChange={handleChange}
          required
        />
        <p>Which English level that you are aiming for?</p>
        <input
          type="text"
          placeholder="Enter your answer"
          value={inputValue}
          onChange={handleChange}
          required
        />
        <button type="submit">Submit</button>

    </div>
    
  );
}

export default StudentForm;
