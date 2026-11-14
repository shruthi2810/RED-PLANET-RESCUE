# RED PLANET RESCUE
### A Junior Astronaut Mission Trainer

An educational Mars mission simulator that helps learners understand the challenges of managing a crew and resources during a Mars mission.

## Features
- Mission status and Sol tracking
- Crew and resource monitoring
- Battery and power management
- Radiation information
- Mars weather data using NASA Curiosity REMS observations
- Threat detection and advisor recommendations
- Mission reports
- Interactive React dashboard

## Technology Stack
- Python and Flask
- SQLite
- React and Vite
- JavaScript and CSS

## Project Structure
- backend/ - Flask APIs, mission logic and database
- frontend/ - React user interface
- README.md - Project documentation

## Requirements
- Python 3.10 or later
- Node.js and npm

## Run the Project

### Backend
Open PowerShell in the project folder:

    cd backend
    .\.venv\Scripts\python.exe -m pip install -r requirements.txt
    .\.venv\Scripts\python.exe app.py

Backend URL: http://127.0.0.1:5000

### Frontend
Open a second terminal in the project folder:

    cd frontend
    npm install
    npm run dev

Frontend URL: http://localhost:5173

## Data Source
The project includes a NASA Curiosity Rover REMS weather-data file.

## Disclaimer
This is an educational simulation. It is not an official NASA product and is not intended for real spacecraft operations or astronaut safety decisions.
