# Development startup.

The development instructions here list setup for both the backend (a Python django application with a PostgreSQL database), as well as the frontend (a React application with Babel ES6 javascript). Note that this is a complex web application, and therefore multiple steps are required:

1. Setting up the [python webserver](#python-webserver-setup) backend
2. Setting up the [database](#database-setup)
3. Syncing the [webserver and the database](#webserver-database-sync)
4. Setting up the [frontend bundling environment](#frontend-javascript-bundling)
5. Loading example [ENCODE data](#loading-encode-data)
6. Running the [development server](#starting-the-development-server)

To begin, clone this repository:

    git clone git@github.com:shapiromatron/orio-web.git

The path where this repository is found on your computer will be the project-root path, referred to frequently in the rest of this documentation.

## Python webserver setup

Requires the following software before beginning:

- Python 3.4+
- PostgreSQL 9.4+
- Python virtualenv and virtualenvwrapper
- PhantomJS 2.1+

Create a new python virtual environment, we'll use the virtual environment name `orio-web` throughout the documentation. If you have [virtualenvwrapper](https://pypi.python.org/pypi/virtualenvwrapper/) installed, you can create a new environment using the command below (note that this requires you to specify the path for python 3, which is not the default python with many installations):

    mkvirtualenv orio-web --python=/usr/local/bin/python3

If instead you are using [conda](http://conda.pydata.org/docs/), you can create a new environment using the following command:

    conda create --name orio-web python=3

Next, change paths to the root-path of this project. Then, we'll install all python requirements by running the command:

    pip install -r requirements/dev.txt

Next, change directories into the `/project` path (relative to the root). Copy default django local-development settings:

    cp django_project/settings/local.example.py django_project/settings/local.py

If the virtual environment was created using [virtualenv](https://virtualenv.pypa.io/en/stable/), use the following to set commands to start when activating the virtual environment:

    echo "export DJANGO_SETTINGS_MODULE=django_project.settings.local" >> $VIRTUAL_ENV/bin/postactivate
    echo "unset DJANGO_SETTINGS_MODULE" >> $VIRTUAL_ENV/bin/postdeactivate

If using [conda](http://conda.pydata.org/docs/), use the following commands to properly set up environment variables. First, locate and enter the directory set up for the conda environment, such as `/home/smorrissey/anaconda/envs/orio-web`. Then create the following subdirectories and files:

    cd /home/smorrissey/anaconda/envs/orio-web
    mkdir -p ./etc/conda/activate.d
    mkdir -p ./etc/conda/deactivate.d
    touch ./etc/conda/activate.d/env_vars.sh
    touch ./etc/conda/deactivate.d/env_vars.sh

Edit the two files. `./etc/conda/activate.d/env_vars.sh` should include this:

    #!/bin/sh

    export DJANGO_SETTINGS_MODULE=django_project.settings.local
    export DYLD_FALLBACK_LIBRARY_PATH=$HOME/anaconda/lib/:$DYLD_FALLBACK_LIBRARY_PATH

`./etc/conda/activate.d/env_vars.sh` should include this:

    #!/bin/sh

    unset DJANGO_SETTINGS_MODULE
    unset DYLD_FALLBACK_LIBRARY_PATH

## Database setup

Next, create a database:

    createdb -E UTF-8 orio

## Webserver database sync

Restart your virtual environment (`deactivate`, then `workon orio-web`). Navigate
to the `/project` path in the repository.

    python manage.py migrate
    python manage.py createsuperuser
    python manage.py download_ucsc_tools

## Frontend Javascript bundling

Make sure [node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) are installed, and are accessible in our environment.

Then, change directory  to the `/project` path of our project. Run the following command, which will install all javascript packages for our development environment:

    npm install --save-dev

After loading all frontend dependencies with the command above, we can run a command to watch our javascript location to compile and push updates to the website (detailed below).

*Note*: if you're using sublime text as a text editor, you may want to download the [Babel](https://github.com/babel/babel-sublime) package for updated syntax definitions. Then, with a Javascript file open, change the default syntax highlighting to Babel.

References:

- [Webpack and django](http://owaislone.org/blog/webpack-plus-reactjs-and-django/)
- [React for beginners](https://reactforbeginners.com/)

## Loading ENCODE data

Input bigWig data are very large and therefore not included in the repository. To load ENCODE data into the development environment, you'll need to have the bigWig files and a JSON file with additional metadata describing these files.

Example data can be downloaded here:

- [ENCODE data subset](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/encode.zip) (15GB :bangbang:)
- [ENCODE data subset JSON metadata](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/load_encode.json) (6 MB)
- [Example feature-list](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/unt1hr.obsTSS.bed) (0.4 MB)
- [Example sort-vector](http://manticore.niehs.nih.gov/ucscview/shapiroaj4/wgEncodeBroadHistoneA549CtcfEtoh02Sig.sortVector.txt) (0.2 MB)

The feature-list and sort-vector are loaded from the the web-interface after the server has been started (see below).

To load the encode data:

1. Unzip the encode data subset into a `/data` folder from the root-folder of the application. After unzipping, the file structure should look like this:

        /
            data/
                encode/
                    hg19/
            docs/
            notebooks/
            project/
            public/
            ...

2. Navigate to the `/project` path, an execute the following command, using the downloaded ENCODE JSON metadata file above:

        python manage.py load_encode /path/to/load_encode.json

**Caution: This management command will delete all ENCODE objects in the database**

## Starting the development server

Whenever we want to start coding, we'll need to start the django backend application and the javascript frontend hot--reloading application.

Start the backend python client in one terminal window:

    workon orio-web
    cd /path/to/orio-web/project/
    python manage.py runserver 9000

Start the javascript bundler in another terminal window:

    cd /path/to/orio-web/project/
    node webpack.devserver.js

Navigate to [localhost:9000](http://127.0.0.1:9000/), and start developing!

## Using the bundled development environment

For quicker development, ORIO includes a Makefile command which creates a [tmux](https://tmux.github.io/)
terminal for opening all required tabs for development. To execute, use the command:

    make dev

You can modify the tmux environment by creating a local copy:

    cp bin/dev.sh bin/dev.local.sh

# Additional optional commands

## Using celery task manager

On the production server, celery tasks are used to run long-running tasks asynchronously. By default celery is not used on the development environment and tasks are handled synchronously.

To use celery, you'll need to spawn a new celery process:

    workon orio-web
    celery worker -A django_project -l info

In addition, modify your environment variables:

    workon orio-web
    echo "export \"USE_CELERY_IN_DEV=True\"" >> $VIRTUAL_ENV/bin/postactivate

## IPython/Jupyter notebooks (optional)

If interested in the [ipython/jupyter notebooks](http://jupyter.org/) , you can run the notebook server using this command:

    workon orio-web
    python manage.py shell_plus --notebook

Then, navigate to [localhost:8888](http://127.0.0.1:8888/) to view the notebooks.
