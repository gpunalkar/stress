# Setting up

First, it's recommended that [npm](http://npmjs.org/) is installed. Just run:

    curl http://npmjs.org/install.sh | sh

The clone nodeload and run `npm link`

    git clone git://github.com/jimschubert/stress.git
    cd nodeload
    npm install expresso -g
    npm link

which will install the unit testing framework [expresso](http://visionmedia.github.com/expresso) and puts a symlink to `nodeload` in the node library path.

Use expresso to run the tests from the root directory:

    expresso
    
    > 100% 20 tests
