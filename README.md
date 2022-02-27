# Gatter

## Development Quick Start

* Enable the development environment: `. ./envr.ps1`
* Run tests: `tests`
* Run app in development mode: `dev`

# Development Environment Setup

## Windows 10

### Environment Dependencies

* Windows Terminal: https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701
* PowerShell >= 5.1: Included in Windows 10, `$PSVersionTable` to confirm.
* git: https://git-scm.com/download/win
* Node.js: https://nodejs.org/en/download/
* Python >= 3.8: https://www.microsoft.com/en-us/p/python-310/9pjpw5ldxlz5

### Fork and Clone This Repository

* From https://github.com/JPHutchins/gatter, "Fork" the repository to your own Github account.
* Open Windows Terminal (Windows PowerShell) and navigate to the desired parent folder for your clone, e.g. `cd ~/repos`
* Clone your fork: `git clone git@github.com:<YOUR_GITHUB_ACCOUNT>/gatter.git`

### Setup Environment and Install Application Dependencies

* Open Windows Terminal (Windows PowerShell) and navigate to the root of this repository clone, e.g. `cd ~/repos/gatter`
* Create the Python virtual environment (venv): `python -m venv backend/venv`
* Create a local copy of the `envr` config: `cp envr-default envr-local`
* Open `envr-local` and change `PYTHON_ALIAS=python3` to `PYTHON_ALIAS=python` (Windows venv calls its python binary python, not python3)
* Enable the development environment: `. ./envr.ps1`  
  * *Note: `envr` will prefix `(gatter)` to your prompt when the environment is enabled.  Each time you begin work on the repository you must enable the environment.*
* Install the Python dependencies: `pip3 install -r backend/requirements.txt`
* Install the JavaScript dependencies: 
    ```
    cd frontend
    npm install
    cd ..
    ```
* Run tests to confirm environment setup: `tests`
