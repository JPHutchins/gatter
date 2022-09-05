# Gatter

## Development Quick Start

* Run app in development mode: `npm run dev --prefix frontend`
* Build electron app: `npm run ebuild --prefix frontend`

# Development Environment Setup

## Windows 10

### Environment Dependencies

* Windows Terminal: https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701
* PowerShell >= 5.1: Included in Windows 10, `$PSVersionTable` to confirm.
* git: https://git-scm.com/download/win
* Node.js: https://nodejs.org/en/download/
* Python >= 3.10: https://www.microsoft.com/en-us/p/python-310/9pjpw5ldxlz5
* Poetry: https://python-poetry.org/

### Fork and Clone This Repository

* From https://github.com/JPHutchins/gatter, "Fork" the repository to your own Github account.
* Open Windows Terminal (Windows PowerShell) and navigate to the desired parent folder for your clone, e.g. `cd ~/repos`
* Clone your fork: `git clone git@github.com:<YOUR_GITHUB_ACCOUNT>/gatter.git`

### Setup Environment and Install Application Dependencies

* Open Windows Terminal (Windows PowerShell) and navigate to the root of this repository clone, e.g. `cd ~/repos/gatter`
* Install the Python dependencies:
    ```
    cd backend
    poetry install
    tox  # run tests to confirm environment setup
    cd ..
    ```
* Install the JavaScript dependencies: 
    ```
    cd frontend
    npm install
    cd ..
    ```

### Run the application

From repo root: `npm run dev --prefix frontend`

You could also run the frontend and backend separately in two terminals:
* from `/backend`: `poetry run python3 -m gatterserver`
* from `/frontend`: `npm start`
